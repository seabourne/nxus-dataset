/*
* @Author: mike
* @Date:   2016-05-14 09:23:14
* @Last Modified 2016-06-08
* @Last Modified time: 2016-06-08 08:02:01
*/

'use strict';

import DataSet from './models/DataSet'
import DataRow from './models/DataRow'
import * as mconst from './models/modelConstants'

import morph from 'morph'
import nodeUUID from 'node-uuid'

import _ from 'underscore'

export default class DataSets {

  constructor(app) {
  
    this.app = app
    this.admin = this.app.get('admin-ui')
    this.templater = this.app.get('templater')
    this.loader = this.app.get('data-loader')
    this.storage = this.app.get('storage')

    this.storage.model(DataSet)
    this.storage.model(DataRow)

    this.templater.templateDir(__dirname+"/../views")
    this.templater.replace().templateFunction("view-dataset-detail", (opts) => {
      opts.template = 'page'
      return this.view(opts.req)
    })

    this.loader.on('model.datarow', this._processDataRow.bind(this))

    this.app.get('base-ui').viewModel('dataset', {display: ['name', 'source', 'description']})

    this.admin.adminModel('dataset', {
      display: ['name', 'source', 'description'],
      iconClass: 'fa fa-list'
    })

    this.admin.instanceAction('dataset', 'Upload Data', 'data', {iconClass: 'fa fa-upload'})
    this.admin.instanceAction('dataset', 'View Data', 'view', {iconClass: 'fa fa-eye'})
  
    this.admin.adminPage('Upload Data', 'datasets/:id/data', {nav: false}, this.dataUpload.bind(this))
    this.admin.adminPage('View Data', 'datasets/:id/view', {nav: false}, this.view.bind(this)) 

    this.admin.adminRoute('post', 'datasets/:id/data/save', this.saveDataUpload.bind(this)) //workaround - url is different for post

    this.admin.replace().adminRoute('get', 'datasets/:id/remove',  this.removeDataRowsForSet.bind(this)) //intercept admin-ui default dataset delete 
    this.admin.replace().adminRoute('get', 'datasets/:id/edit', this.editDataSet.bind(this))
    
    this.loader.uploadPath('/admin/datasets/:id/data/save', 'csvfile')
  }

  /**
   * Handler for data rows to clean up values.
   * @param  object row is the row of data with CSV column-header keys
   */
  _processDataRow(row) {
    let cleanRow = _.mapObject(row, (val,key) => {
      if (typeof(val) != 'undefined') {
        let inferredType = mconst.DECIMAL_TYPE
        if (val.endsWith('%')) {
          let what = Number.parseFloat(val)
          if (_.isNumber(what) && !Number.isNaN(what)) {
            val = what
          }
          inferredType = mconst.PERCENT_TYPE
        }
        return val
      } else {
        this.app.log.debug( "_processDataRow undefined at:", key)
        return ''
      }
    })
    this.app.log.debug( "_processDataRow cleanRow:", cleanRow)
    return cleanRow
  }

  dataUpload(req, res) {
    let opts = {
      id: req.params.id
    }
    return this.templater.render('admin-dataset-upload', opts)
  }



  view(req) {
    let opts = {
      id: req.params.id
    }
    this.app.log.debug("View() dataset id  ", req.params.id)
    return this.storage.getModel(['dataset', 'datarow']).spread((Set, Row) => {
      return [Set.findOne(req.params.id), Row.find({dataset: req.params.id})]
    }).spread((set, rows) => {
      opts.morph = morph
      opts.rows = rows
      opts.set = set
      opts.fields = (set.fields ? set.fields : [])
      return this.templater.render('view-dataset-data', opts)
    })
  }

  saveDataUpload(req, res) {
    let setId = req.param('id')
    let currentFields = []
    if(!req.file) {
      req.flash('error', "Error processing rows: no file supplied for the data.")
      return res.redirect('/admin/datasets/'+setId+'/data')
    }
    return this.loader.importFileToModel('datarow', req.file.path, {type: 'csv', strict: false})
    .then((rows) => {
      let inferredTypeMap = {}
      _.each(rows, (rowElem) => {
        this.app.log.debug("saveDataUpload processing row rowElem", rowElem)
        if (setId) {
          rowElem.dataset = setId
          currentFields = _.unique(_.compact(currentFields.concat(_.keys(rowElem))))
          rowElem.save().catch((err) => {
            this.app.log.error("nxus-dataset update failed for datarow " + rowElem.id, err)
          })
        }
      })
      return this.storage.getModel('dataset').then((DataSet) => {
        return DataSet.findOne(setId)
      }).then((set) => {
        let fieldList = _.map(_.without(currentFields, 'id', 'dataset'), (columnName) => {
          let genId = this._generateUniqueId()
          let newField = { name: columnName, id: genId }
          return newField
        })
        set.rowCount = rows.length
        set.fields = fieldList
        this.app.log.debug( "nxus-dataset saveDataUpload dataset " + setId + " fields:", fieldList )
        return set.save().then( () => {
          req.flash('info', "Successfully loaded " + rows.length + " data rows")
          res.redirect('/admin/datasets')
        })
      })
    }).catch((e) => {
      this.app.log.error( "error loading data rows  ", e, " at: ", e.stack);
      req.flash('error', "Error processing rows")
      return res.redirect('/admin/datasets/'+setId+'/data')
    })
  } 

  removeDataRowsForSet(req, res) {
    let dataSetId = req.param('id');
    return this.storage.getModel('datarow')
    .then( (dataRowModel) => {
      return dataRowModel.destroy({dataset: dataSetId}) 
    }).then( (rowsRemoved) => {
      this.app.log.debug("remove DataSet removed ", rowsRemoved.length, " from dataset ", dataSetId); 
      req.flash('info', "Successfully removed "+rowsRemoved.length+" data rows")
      return this.storage.getModel('dataset').then( (DataSetModel) => {
        return DataSetModel.destroy({id: dataSetId}).then( (dsRemoved) => {
          this.app.log.debug("removed DataSet ", dataSetId); 
          res.redirect('/admin/datasets')
        })
      })
    }).catch((e) => {
      this.app.log.debug( "nxus-dataset error removing data rows from dataset " + dataSetId, e);
      req.flash('error', "Error removing dataset " + e)
      return res.redirect('/admin/datasets/')
    })
  }

  editDataSet(req, res) {
    let dataSetId = req.param('id');
    let opts = {}
    this.app.log.debug("editDataSet " + dataSetId)
    return this.storage.getModel('dataset')
    .then( (dataSetModel) => {
      return dataSetModel.findOne(dataSetId)
    }).then( (foundDataSet) => {
      opts.id = dataSetId
      opts.dataset = foundDataSet
      this.app.log.debug("editDataSet p[ts" , opts)
      return this.templater.render('edit-dataset-form', opts)
    }).catch( (err) => {
      this.app.log.error("nxus-dataset error on edit of dataset " + dataSetId, err.stack)
      req.flash('error', "Error editing dataset " + err)
      return res.redirect('/admin/datasets/')
    })
  }

 _generateUniqueId() {
    return nodeUUID.v1();
 }


}