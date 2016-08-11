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

    this.loader.on('model.datarow', this._processLoaderDataRow.bind(this))

    this.app.get('base-ui').viewModel('dataset', {display: ['name', 'source', 'description']})

    this.admin.adminModel('dataset', {
      display: ['name', 'source', 'description'],
      iconClass: 'fa fa-list'
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

  /**
   * clean up the datarow after storage,
   * associating with the given dataset ID.
   * @param  {[datarow]} row       DataRow instance to put under given DataSet ID
   * @param  {[type]} dataSetId [description]
   * @return the original row passed in, with some property modifications.
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
    //nb: important to return changed row rather than new object
    return row
  }

  /**
   * put in a data type for each field in uploaded datarow
   * @param  {[datarow]} sample [representative row of data]
   * @return {[object]}        [map by datarow key of best estimate for the type]
   */
  _buildIntialDataTypes(sample) {
    let typeMap = {}
    _.each(sample, (val,key) => {
      if (typeof(val) == 'string') {
        if (val.endsWith('%')) {
          typeMap[key] = mconst.PERCENT_TYPE
        } else if (! isNaN(parseFloat(val))) {
          typeMap[key] = mconst.DECIMAL_TYPE
        } else {
          typeMap[key] = mconst.STRING_TYPE
        }
      }
      if ( typeMap[key] != mconst.PERCENT_TYPE && 
        ((-1 < key.toLowerCase().indexOf('percent')) || (-1 < key.indexOf('%'))) ) {
        typeMap[key] = mconst.PERCENT_TYPE
      }
    })
    return typeMap
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
      let inferredTypeMap = {}
      let currentFields = []
      _.each(rows, (rowElem, index) => {
        // this.app.log.debug("saveDataUpload " + index + " processing rowElem", rowElem)
        if (Array.isArray(rowElem)) {
          rowElem = rowElem[0] //work-around for model handler dupe bug in data-loader 3.0.0
        }
        if (_.isEmpty(inferredTypeMap)) {
          inferredTypeMap = this._buildIntialDataTypes(rowElem)
          currentFields = _.keys(rowElem)
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
        let fieldList = _.map(_.without(currentFields, 'id', 'dataset', 'true', 'createdAt', 'updatedAt'), (columnName) => {
          let genId = this._generateUniqueId()
          let newField = { name: columnName, id: genId, label: morph.toTitle(columnName), primaryKey: false, visible: true}
          if (inferredTypeMap[columnName]) newField.type = inferredTypeMap[columnName]
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