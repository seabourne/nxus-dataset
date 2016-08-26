/*
* @Author: mike
* @Date:   2016-05-14 09:23:14
* @Last Modified 2016-06-08
* @Last Modified time: 2016-06-08 08:02:01
*/

'use strict';

import DataSet from './models/DataSet'
import DataRow from './models/DataRow'
import DataPresentation from './models/DataPresentation'
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
    this.storage.model(DataPresentation)

    this.templater.templateDir(__dirname+"/../views")
    this.templater.replace().templateFunction("view-dataset-detail", (opts) => {
      opts.template = 'page'
      return this.view(opts.req)
    })

    this.loader.on('model.datarow', this._processLoaderDataRow.bind(this))

    this.app.get('base-ui').viewModel('dataset', {display: ['name', 'source', 'description']})

    this.admin.adminModel('dataset', {
      display: ['name', 'source', 'description'],
      iconClass: 'fa fa-list'
    })

    this.admin.adminModel('datapresentation', {
      display: ['name', 'label', 'fieldIds'],
      iconClass: 'fa fa-table'
    })

    this.admin.instanceAction('dataset', 'Upload Data', 'data', {iconClass: 'fa fa-upload'})
    this.admin.instanceAction('dataset', 'View Data', 'view', {iconClass: 'fa fa-eye'})
  
    this.admin.adminPage('Upload Data', 'datasets/:id/data', {nav: false}, this.dataUpload.bind(this))
    this.admin.adminPage('View Data', 'datasets/:id/view', {nav: false}, this.view.bind(this)) 

    this.admin.adminRoute('post', 'datasets/:id/data/save', this.saveDataUpload.bind(this)) //save datarows for dataset - url is different for post
    this.admin.adminRoute('post', 'datasets/:id/dataset/save', this.saveDataSet.bind(this)) //update dataset, from custom form (see views/admin-dataset-form)
    this.admin.adminRoute('post', 'datasets/dataset/save', this.saveDataSet.bind(this)) //new dataset, from custom form (see views/admin-dataset-form)

    this.admin.replace().adminRoute('get', 'datasets/:id/remove',  this.removeDataRowsForSet.bind(this)) //intercept admin-ui default dataset delete 
    
    this.loader.uploadPath('/admin/datasets/:id/data/save', 'csvfile')
  }

  /**
   * Handler for data rows to clean up records; attached to loader's 'model.datarow'.
   * @param  object row is the row of data from CSV column-header keys
   */
  _processLoaderDataRow(row) {
    //catch CSV column headers that would get 
    //over-ridden or conflict downstream.
    if (row.id) {
      row.id_orig = row.id
      delete row.id
    }
    if ( row.dataset) {
      row.dataset_orig = row.dataset
      delete row.dataset
    }
    return row
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
    this.app.log.debug("nxus-dataset View() dataset id  ", req.params.id)
    return this.storage.getModel(['dataset', 'datarow']).spread((Set, Row) => {
      return [dataSetModel.findOne(req.params.id), Row.find({dataset: req.params.id})]
    }).spread((set, rows) => {
      opts.morph = morph
      opts.rows = rows
      opts.set = set
      opts.fields = (set.fields ? set.fields : [])
      return this.templater.render('view-dataset-data', opts)
    })
  }

  /**
   * Transform the datarow after storage,
   * associating with the given dataset ID.
   * @param  {[datarow]} row       DataRow instance to put under given DataSet ID
   * @param  {[string]} dataSetId   Parent DataSet ID
   * @return the original row passed in, with modifications.
   */
  _prepareDataRowInDataSet(row, dataSetId) {
    _.each(row, (val,key) => {
      if (typeof(val) == 'string') {
        if (val.endsWith('%')) {
          let what = Number.parseFloat(val)
          if (_.isNumber(what) && !Number.isNaN(what)) {
            val = what
          }
        }
      } else if (typeof(val) == 'undefined') {
        val = null
      }
      row[key] = val
    })
    row.dataset = dataSetId
    //nb: must return changed row rather than new object
    return row
  }

  /**
   * Based on supplied data row, build array of field info objects
   * which include a unique field-id for each property on the row.
   * @param  {[datarow]} sample [representative row of data]
   * @return { array of object}        [name, id, and type properties for each field]
   */
  _buildFieldInfo(sample) {
    let fields = new Array()
    _.each(_.keys(sample), (key,index) => {
      let type = mconst.STRING_TYPE
      let val = sample[key]
      if (typeof(val) == 'string') {
        if (val.endsWith('%')) {
          type = mconst.PERCENT_TYPE
        } else if (! isNaN(parseFloat(val))) {
          type = mconst.DECIMAL_TYPE
        }
      }
      if ( type != mconst.PERCENT_TYPE && 
        ((-1 < key.toLowerCase().indexOf('percent')) || (-1 < key.indexOf('%'))) ) {
        type = mconst.PERCENT_TYPE
      }
      if (! _.contains(["true", "id", "dataset", "createdAt", "updatedAt"], key)) {
        let genId = this._generateUniqueId()
        fields.push({ name: key, id: genId, label: morph.toTitle(key), type: type, primaryKey: false, visible: true })
      }
    })
    return fields
  }

  /**
   * Save datarows uploaded from CSV,
   * associating each datarow with the parent dataset
   * and gathering summary field information about the collection of rows
   * to store in the parent.
   * 
   */
  saveDataUpload(req, res) {
    let setId = req.param('id')
    if(!req.file) {
      req.flash('error', "Error processing rows: no file supplied for the data.")
      return res.redirect('/admin/datasets/'+setId+'/data')
    }
    return this.loader.importFileToModel('datarow', req.file.path, {type: 'csv', strict: false})
    .then((rows) => {
      let currentFields = []
      _.each(rows, (rowElem) => {
        if (Array.isArray(rowElem)) {
          rowElem = rowElem[0] //work-around for model handler dupe bug in data-loader 3.0.0
        }
        if (_.isEmpty(currentFields)) {
          currentFields = this._buildFieldInfo(rowElem)
        }
        if (setId) {
          let rowToUpdate = this._prepareDataRowInDataSet(rowElem, setId)
          rowToUpdate.save().catch((err) => {
            this.app.log.error("nxus-dataset update failed for datarow " + rowElem.id, err)
          })
        }
      })
      return this.storage.getModel('dataset').then((DataSet) => {
        return DataSet.findOne(setId)
      }).then((set) => {
        //warn about limitation of current implementation if set already has rows.
        if ( 0 < set.rowCount ) {
          this.app.log.error("Adding additional rows to a dataset isn't supported yet")
          req.flash('info', "Uable to add data rows to set with data.")
          return res.redirect('/admin/datasets')
        } 
        set.rowCount = rows.length
        set.fields = currentFields
        this.app.log.debug( "nxus-dataset saveDataUpload dataset " + setId + " fields:", currentFields )
        return set.save().then( () => {
          req.flash('info', "Successfully loaded " + rows.length + " data rows")
          res.redirect('/admin/datasets')
        })
      })
    }).catch((e) => {
      this.app.log.error( "nxus-dataset saveDataUpload() error loading data rows  ", e, " at: ", e.stack);
      req.flash('error', "Error processing rows")
      return res.redirect('/admin/datasets/'+setId+'/data')
    })
  } 

  /**
   * Action when a dataset is removed -
   * removes the dataset and all child datarows.
   */
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

  /**
   * handle POST response for edit existing 
   * or create new dataset
   */
  saveDataSet(req, res) {
    let dataSetId = req.params.id
    this.app.log.debug("saveDataSet id: ", dataSetId)
    if (dataSetId) {
      
      this.storage.getModel('dataset').then((dsmodel) => {
        return dsmodel.findOne(dataSetId)
      }).then((dataset) => {
        dataset.name = req.body.name
        dataset.source = req.body.source
        dataset.description = req.body.description
        _.each( req.body, (value,key) => {
          //update fields from request parameters field_<field.id>_<key>
          if (0 <= key.indexOf('field_')) {
            let pComponents = key.split('_')
            if ( 3 == pComponents.length) {
              let fieldId = pComponents[1]
              let fieldKey = pComponents[2]
              let targetField = _.findWhere(dataset.fields, {id: fieldId})
              if (targetField) {
                targetField[fieldKey] = value
              }
            } 
          }
        })
        return dataset.save().catch( (err) => {
          this.app.log.error("nxus-dataset: dataset update failed on " + dataSetId, err.stack)
          return res.redirect('/admin/datasets')
        }).then( () => {
          return res.redirect('/admin/datasets')
        })
      })
    } else {
      return this.storage.getModel('dataset')
      .then( (dataSetModel) => {
        if ( req.body.name) {
          return dataSetModel.create({name: req.body.name, source: req.body.source, description: req.body.description})
          .then( (newRecord) =>{
            this.app.log.debug("dataset created ", newRecord.id)
            return res.redirect('/admin/datasets')
          })
        } else {
          req.flash('error', "Name is required")
          return res.redirect('/admin/datasets/create')
        }
      })
  }
}

 _generateUniqueId() {
  //maybe overkill for use in cases here,
  // but it's unique across launches of the app
    return nodeUUID.v1();
 }


}