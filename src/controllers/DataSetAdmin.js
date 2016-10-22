import {AdminController} from 'nxus-admin'
import {templater} from 'nxus-templater'
import {actions} from 'nxus-web'
import {router} from 'nxus-router'
import {dataManager} from 'nxus-data-manager'

import _ from 'underscore'
import {Promise} from 'bluebird'

import * as FieldUtil from '../../fieldUtils'

/**
 * Set up admin pages to 
 * edit DataSets,
 * upload associated DataRows,
 * and view the uploaded data.
 */
export default class DataSetAdmin extends AdminController {

  constructor() {
    super({
      modelIdentity: 'datasets-dataset',
      icon: 'fa fa-table',
      ignoreFields: ['id', 'fields', 'rowCount', 'createdAt', 'updatedAt' ],
      instanceTitleField: 'DataSet'
    })
    this._fieldBuilder = new FieldUtil.FieldBuilder()
    //custom datasets edit form template
    templater.replace().template(__dirname+'/../templates/datasets-dataset-form.ejs', this.pageTemplate, this.templatePrefix+"-edit")
    //action and route registered for uploading associated DataRow's for a DataSet
    actions.add(this.templatePrefix + "-list", "Upload", "/upload-datarow/", {
      icon: "fa fa-upload",
      group: "instance"
    })
    templater.replace().template(__dirname+"/../templates/datasets-dataset-admin-upload-datarow.ejs", this.pageTemplate, this.templatePrefix+"-upload-datarow")
    router.route("GET", this.routePrefix+"/upload-datarow/:id", ::this._uploadDataRow)
    router.route("POST", this.routePrefix+"/upload-datarow/:id/save", ::this._uploadDataRowSave)
    dataManager.uploadPath(this.routePrefix+"/upload-datarow/:id/save", 'csvfile')
    //action, route for admin-view of dataset detail, showing datarows
    actions.add(this.templatePrefix + "-list", "View Data", "/view-data/", {
      icon: "fa fa-eye",
      group: "instance"
    })
    templater.replace().template(__dirname+"/../templates/datasets-dataset-view-data.ejs", this.pageTemplate, this.templatePrefix+"-view-datarow")
    router.route("GET", this.routePrefix+"/view-data/:id", ::this.dataSetViewData)
  }

  edit(req, res, query) {
    return super.edit(req, res, query)
    .then( (editContext) => {
      let instance = editContext.object
      this.log.debug( "editing dataset id:  ", instance.id)
      return [this.models['datasets-datarow'].find({dataset: instance.id}), editContext]
    }).spread( (datarows, context) => {
      this.log.debug( "find returned matched datarows:  ", datarows)
      let retObj = {
        datarows: datarows,
        fieldTypes: FieldUtil.FIELD_TYPES,
        ...context
      }
      this.log.debug( "returning enhanced edit context:  ", retObj)
      return retObj
    })
  }

  dataSetViewData(req, res) {
    let setId = req.param('id')
    let opts = {}
    return this.model.findOne(setId).then((dataset) => {
      opts.dataset = dataset
      return this.models['datasets-datarow'].find({dataset: setId})
    }).then( (datarows) => {
      opts.datarows = datarows
      return templater.render(this.templatePrefix+"-view-datarow", opts).then(::res.send)
    })
  }

  /**
   * prepare form for uploading datarows
   */
  _uploadDataRow(req, res) {
    let setId = req.param('id')
    return this.model.findOne(setId).then((dataset) => {
      let opts = {
        id: setId,
        dataset
      }
      return templater.render(this.templatePrefix+"-upload-datarow", opts).then(::res.send)
    })
  }

  /**
   * Handler to take upload file from form 
   * and save datarows uploaded as CSV,
   * associating each datarow with the parent dataset
   * and gathering summary field information about the collection of rows
   * to store in the parent.
   * 
   */
  _uploadDataRowSave(req, res) {
    let setId = req.param('id')
    this.log.debug( "_uploadDataRowSave setId ", setId)
    return Promise.resolve().then( () => {
      if(!req.file) {
        throw new Error('No upload file was supplied for the data')
      }
      return this.models['datasets-datarow'].destroy({dataset: setId}) 
    }).then( () => {
      return dataManager.importFileToModel('datasets-datarow', req.file.path, {type: 'csv', truncate: false, strict: false})
    }).then((rows) => {
      let currentFields = []
      _.each(rows, (rowElem, index) => {
        this.log.debug("saveDataUpload " + index + " processing rowElem", rowElem)
        if (Array.isArray(rowElem)) {
          rowElem = rowElem[0] //work-around for model handler dupe bug in data-loader 3.0.0 (do we need this in 4.0??)
        }
        if (_.isEmpty(currentFields)) {
          currentFields = this._fieldBuilder.buildFieldInfo(rowElem)
        }
        let rowToUpdate = this._prepareDataRowInDataSet(rowElem, setId)
        rowToUpdate.save().catch((err) => {
          this.log.error("nxus-dataset update failed for datarow " + rowElem.id, err)
        })
      })
      return this.model.findOne(setId).then((set) => {
        set.rowCount = rows.length
        set.fields = currentFields
        this.log.debug( "nxus-dataset saveDataUpload dataset " + setId + " fields:", currentFields )
        return set.save().then( () => {
          req.flash('info', "Successfully loaded " + rows.length + " data rows")
          res.redirect(this.routePrefix) //TODO -- route to the edit form for this dataset instead?
        })
      })
    }).catch((e) => {
      this.log.error( "nxus-dataset saveDataUpload() error loading data rows  ", e, " at: ", e.stack);
      req.flash('error', "Error processing rows: " + e)
      return res.redirect(this.routePrefix)
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
    * override EditController save for datasets-dataset:
   * handle POST response for 
   * editing an existing 
   * or creating a new dataset
   */
  save(req, res) {
    let dataSetId = req.params.id
    this.log.debug("save DataSet id: ", dataSetId)
    return Promise.resolve().then( () => {
      if (!dataSetId) {
        if (!req.body.name) {
          throw new Error('DataSet name is required.')
        } else {
          return this.model.create({name: req.body.name, source: req.body.source, description: req.body.description})
          .then( (newRecord) => {
          this.log.debug("dataset created ", newRecord.id)
          return res.redirect(this.routePrefix)
          })
        }
      } else {
        this.model.findOne(dataSetId)
        .then((dataset) => {
          dataset.name = req.body.name
          dataset.source = req.body.source
          dataset.description = req.body.description
          _.each( dataset.fields, (dsField) => {
            dsField.isVisible = false;
            dsField.isPrimaryKey = false;
            _.each(dsField, (value,key) => {
              let formValue = req.body['field.' + key + '.' + dsField.id]
              if (formValue) {
                if (key.startsWith("is")) { //boolean
                  dsField[key] = ("true"==formValue)
                } else {
                  dsField[key] = formValue
                } 
              }
              //field.isPrimaryKey in body is set to field.id
              if (dsField.id == req.body['field.isPrimaryKey']) {
                dsField.isPrimaryKey = true
              }
            })
          })
          return dataset
        }).then( (dataset) => {
          return dataset.save()
        }).then( () => {
          return res.redirect(this.routePrefix)
        })
      }
    }).catch( (err) => {
      req.flash('error', 'Unable to create or edit: ' + err.message)
      return res.redirect(this.routePrefix)
    })
  }

  /**
   * Handler for removing dataset.
   * Deleting a dataset must also delete child datarows
   */
  remove(req, res) {
    let dataSetId = req.param('id');
    return this.models['datasets-datarow'].destroy({dataset: dataSetId}) 
    .then( (rowsRemoved) => {
      this.log.debug("remove datasets-dataset deleted ", rowsRemoved.length, " data rows from dataset ", dataSetId); 
      req.flash('info', "Successfully removed "+rowsRemoved.length+" data rows")
      return this.model.destroy({id: dataSetId}).then( (dsRemoved) => {
        this.log.debug("removed DataSet ", dataSetId); 
        res.redirect(this.routePrefix)
      })
    }).catch((e) => {
      this.log.debug( "nxus-dataset error removing data rows from dataset " + dataSetId, e);
      req.flash('error', "Error removing dataset " + e.message)
      res.redirect(this.routePrefix)
    })
  }  

  modelNames() {
    return [ 'datasets-dataset', 'datasets-datarow' ]
  }

}