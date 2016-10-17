import {AdminController} from 'nxus-admin'
import {templater} from 'nxus-templater'
import {actions} from 'nxus-web'
import {router} from 'nxus-router'
import _ from 'underscore'
import morph from 'morph'
import nodeUUID from 'node-uuid'
import {dataManager} from 'nxus-data-manager'

import * as field from '../fieldConstants'

export default class DataSetAdmin extends AdminController {

  constructor() {
    super({
      modelIdentity: 'datasets-dataset',
      icon: 'fa fa-table',
      ignoreFields: ['id', 'fields', 'rowCount', 'createdAt', 'updatedAt' ],
      instanceTitleField: 'DataSet'
    })
    //custom datasets edit form template
    templater.replace().template(__dirname+"/../templates/datasets-dataset-form.ejs", this.pageTemplate, this.templatePrefix+"-edit")
    //action and route registered for uploading associated DataRow's for a DataSet
    actions.add(this.templatePrefix + "-list", "Upload", "/upload-data/", {
      icon: "fa fa-upload",
      group: "instance"
    })
    templater.replace().template(__dirname+"/../templates/datasets-dataset-admin-upload-datarow.ejs", this.pageTemplate, this.templatePrefix+"-upload-datarow")
    router.route("GET", this.routePrefix+"/upload-data/:id", ::this.dataSetUploadDataRow)
    router.route("POST", this.routePrefix+"/upload-data/:id/save", ::this.dataSetUploadDataRowSave)
    //TODO - adjust when the data-manager is ready for use
    dataManager.uploadPath(this.routePrefix+"/upload-data/:id/save", 'csvfile')
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
        fieldTypes: field.FIELD_TYPES,
        ...context
      }
      this.log.debug( "returning enhanced edit context:  ", retObj)
      return retObj
    })
  }

  dataSetUploadDataRow(req, res) {
    let opts = {
      id: req.params.id
    }
    return templater.render(this.templatePrefix+"-upload-datarow", opts).then(::res.send)
  }

  /**
   * Save datarows uploaded from CSV,
   * associating each datarow with the parent dataset
   * and gathering summary field information about the collection of rows
   * to store in the parent.
   * 
   */
  dataSetUploadDataRowSave(req, res) {

    let setId = req.param('id')
    this.log.debug( "dataSetUploadDataRowSave setId ", setId, " req ", _.keys(req))
    if(!req.file) {
      req.flash('error', "Error processing rows: no file supplied for the data.")
      return res.redirect(this.routePrefix)
    }
    /*
      TODO: integrate the dataManager and define/initialize
     */
    return dataManager.importFileToModel('datasets-datarow', req.file.path, {type: 'csv', truncate: true, strict: false})
    .then((rows) => {
      let currentFields = []
      _.each(rows, (rowElem, index) => {
        this.log.debug("saveDataUpload " + index + " processing rowElem", rowElem)
        if (Array.isArray(rowElem)) {
          rowElem = rowElem[0] //work-around for model handler dupe bug in data-loader 3.0.0 (do we need this in 4.0??)
        }
        if (_.isEmpty(currentFields)) {
          currentFields = this._buildFieldInfo(rowElem)
        }
        if (setId) {
          let rowToUpdate = this._prepareDataRowInDataSet(rowElem, setId)
          rowToUpdate.save().catch((err) => {
            this.log.error("nxus-dataset update failed for datarow " + rowElem.id, err)
          })
        }
      })
      return this.model.findOne(setId).then((set) => {
        //warn about limitation of current implementation if set already has rows.
        if ( 0 < set.rowCount ) {
          this.log.error("Adding additional rows to a dataset isn't supported yet")
          req.flash('info', "Uable to add data rows to set with data.")
          return res.redirect(this.routePrefix)
        } 
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
      req.flash('error', "Error processing rows")
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
   * Based on supplied data row, build array of field info objects
   * which include a unique field-id for each property on the row.
   * @param  {[datarow]} sample [representative row of data]
   * @return { array of object}        [name, id, and type properties for each field]
   */
  _buildFieldInfo(sample) {
    let fields = new Array()
    _.each(_.keys(sample), (key,index) => {
      let type = field.STRING_TYPE
      let val = sample[key]
      if (typeof(val) == 'string') {
        if (val.endsWith('%')) {
          type = field.PERCENT_TYPE
        } else if (! isNaN(parseFloat(val))) {
          type = field.DECIMAL_TYPE
        }
      }
      if ( type != field.PERCENT_TYPE && 
        ((-1 < key.toLowerCase().indexOf('percent')) || (-1 < key.indexOf('%'))) ) {
        type = field.PERCENT_TYPE
      }
      if (! _.contains(["true", "id", "dataset", "createdAt", "updatedAt"], key)) {
        let field = field.FIELD_DEFAULTS
        field.name = key
        field.id = this._generateUniqueId()
        field.label = morph.toTitle(key)
        field.type = type
        fields.push(field)
      }
    })
    return fields
  }

   /**
    * override EditController save:
   * handle POST response for edit existing 
   * or create new dataset
   */
  save(req, res) {
    let dataSetId = req.params.id
    this.log.debug("save DataSet id: ", dataSetId)
    if (dataSetId) {
      this.model.findOne(dataSetId)
      .then((dataset) => {
        dataset.name = req.body.name
        dataset.source = req.body.source
        dataset.description = req.body.description
        _.each( dataset.fields, (dsField) => {
          dsField.visible = false;
          dsField.primaryKey = false;
        })
        _.each( req.body, (value,key) => {
          //update fields from request parameters field_<field.id>_<key>
          if (0 <= key.indexOf('field_')) {
            this.log.debug( "save req body key ", key, " value ", value)
            let pComponents = key.split('_')
            if (3 == pComponents.length) {
              let fieldId = pComponents[1]
              let fieldKey = pComponents[2]
              let targetField = _.findWhere(dataset.fields, {id: fieldId})
              if (targetField) {
                if (fieldKey.startsWith("is")) {
                  targetField[fieldKey] = ("true"==value)
                } else {
                  targetField[fieldKey] = value
                }
              }
            } else if (2 == pComponents.length) {
              if ("primaryKey" == pComponents[1]) {
                let fieldId = value
                let targetField = _.findWhere(dataset.fields, {id: fieldId})
                if (targetField) {
                  targetField["primaryKey"] = true
                }
              }
            }
          }
        })
        return dataset.save().catch( (err) => {
          this.log.error("nxus-dataset: dataset update failed on " + dataSetId, err.stack)
          return res.redirect(this.routePrefix)
        }).then( () => {
          return res.redirect(this.routePrefix)
        })
      })
    } else {
        if ( req.body.name) {
          return this.model.create({name: req.body.name, source: req.body.source, description: req.body.description})
          .then( (newRecord) =>{
            this.log.debug("dataset created ", newRecord.id)
            return res.redirect(this.routePrefix)
          })
        } else {
          req.flash('error', "Name is required")
          return res.redirect(this.routePrefix + '/create')
        }
    }
  }

  remove(req, res) {
    let dataSetId = req.param('id');
    return this.models['datasets-datarow'].destroy({dataset: dataSetId}) 
    .then( (rowsRemoved) => {
      this.log.debug("remove DataSet removed ", rowsRemoved.length, " from dataset ", dataSetId); 
      req.flash('info', "Successfully removed "+rowsRemoved.length+" data rows")
      return this.model.destroy({id: dataSetId}).then( (dsRemoved) => {
        this.log.debug("removed DataSet ", dataSetId); 
        res.redirect(this.routePrefix)
      })
    }).catch((e) => {
      this.log.debug( "nxus-dataset error removing data rows from dataset " + dataSetId, e);
      req.flash('error', "Error removing dataset " + e)
      res.redirect(this.routePrefix)
    })
  }  

  _generateUniqueId() {
  //maybe overkill for use in cases here,
  // but it's unique across launches of the app
    return nodeUUID.v1();
  }

  modelNames() {
    return [ 'datasets-dataset', 'datasets-datarow' ]
  }

}