import {HasModels, storage} from 'nxus-storage'
import _ from 'underscore'
import {Promise} from 'bluebird'

import {FieldUtils} from './fieldUtils'
import DataPresentationAdmin from './controllers/DataPresentationAdmin'
import DataSetAdmin from './controllers/DataSetAdmin'
import DataSetView from './controllers/DataSetView'

class DataSets extends HasModels {
  constructor () {
    super()

    //TODO: fix packaging? so these aren't needed (they break unit tests...):
    new DataPresentationAdmin()
    new DataSetAdmin()
    new DataSetView()
  }
  /**
   * Gather DataPresentation objects returned by the given query,
   * returning normalized data for each in an arry
   * @param  {Object} query WaterLine query on DataPresentation model
   * @return {arry of objects}       each object in the array is the full data for one of the queried presentations, 
   * returned in the format provided by `extractDataForPresentation()`
   */
  loadPresentations(query) {
    return storage.getModel(['datasets-datapresentation', 'datasets-dataset', 'datasets-datarow'])
      .spread( (dataPresentModel, dataSetModel, dataRowModel) => {
        return ([dataPresentModel.find(query), dataSetModel, dataRowModel])
      }).spread( (presentations, dataSetModel, dataRowModel) => {
        let allPresentationsFieldIds = _.flatten(_.pluck(presentations, 'fieldIds'))
        this.log.debug( "got presentations ids: ", _.pluck(presentations, 'id'), " concated all field ids ", allPresentationsFieldIds )
        return([presentations, dataSetModel.find({'fields.id': allPresentationsFieldIds}), dataRowModel])
      }).spread( (presentations, dataSets, dataRowModel) => {
        return([presentations, dataSets, dataRowModel.find({dataset: _.pluck(dataSets, 'id')})])
      }).spread( (presentations, dataSets, dataRows) => {
        if (presentations) {
          let extractedDataArr = []
          presentations.forEach( (present) => {
            let presentData = this.extractDataForPresentation(present, dataSets, dataRows)
            extractedDataArr.push(presentData)
         })
         return extractedDataArr
        } else {
          return []
        }
      })
  }

  loadPresentationByName(name) {
    return loadPresentations({name: name})
  }

  /**
   * Extract data relevant to the DataPresentation from collections of DataSet's and DataRow's.
   * Creates a normalized data object, with header info from the presentation and all matching DataRows trimmed to just the fields needed.
   * @param  {[DataPresentation]} presentation 
   * @param  {[collection of DataSet]} datasets     DataSets that span the field-id's in the supplied presentation. Can be a super-set.
   * @param  {[collection of DataRow]} datarows     [description]
   * @return {[Object]}    with properties:
   *   name - name of the presentation;
   *   id - ID of the presentation;
   *   label - label of the presentation;
   *   fields - object with properties the DataPresentation field-ids including referenced DataSet primary key fields; values are the field data from DataSet
   *   data - array of DataRow records, transformed to use the unique field-id's as property names. 
   *   Records hold only values that are selected in the presentation, plus any defined primary-key fields.
   */
  extractDataForPresentation(presentation, datasets, datarows) {
    let presentationData = { 
      name: presentation.name, 
      id: presentation.id, 
      label: presentation.label, 
      fields: {}, 
      data: []
    }
    presentation.fieldIds.forEach( (fieldId) => {
      let targetField = {}
      let dataset = datasets.find((set) => { 
        targetField = _.findWhere(set.fields, {id:fieldId})
        return targetField
      })
      if (targetField && targetField.name) {
        let primaryKeyFields = _.where(dataset.fields, {isPrimaryKey: true})
        _.union([targetField],primaryKeyFields).forEach( (field) => {
            presentationData.fields[field.id] = {
            name: field.name, 
            label: field.label, 
            isPrimaryKey: field.isPrimaryKey,
            dataset: dataset.id
          }
        })
        datarows.forEach( (row, index) => {
          if (dataset.id == row.dataset && _.has(row, targetField.name)) {
            let dataRow = {}
            dataRow[targetField.id] = row[targetField.name]
            if (primaryKeyFields) {
              primaryKeyFields.forEach( (keyField) => {
                dataRow[keyField.id] = row[keyField.name]
              })
            }
            if (dataRow) presentationData.data.push(dataRow)
          }
        })
      }
    })
    return presentationData
  }

  formatPresentationDataByFieldLabel(presentationData) {
    if (_.isArray(presentationData)) {
      return _.map(presentationData, this.formatDataWithFieldLabel)
    } else {
      return this.formatDataWithFieldLabel(presentationData)
    }
  }

  formatDataWithFieldLabel(presentationData) {
    let formattedObj = { 
      name: presentationData.name, 
      id: presentationData.id, 
      label: presentationData.label,
      fields: presentationData.fields
    }
    let byNameData = []
    if (presentationData.data) {
      presentationData.data.forEach( (dataRow) => {
        _.keys(dataRow).forEach( (key) => {
          let fieldInfo = presentationData.fields[key]
          if (fieldInfo) byNameData.push({ [fieldInfo.label]: dataRow[key]})
        })
      })
    }
    formattedObj.data = byNameData
    return formattedObj
  }

  indexDataIntoObjectByPrimaryKeyValue(presentationData) {
    //group records by the value of given field-id
    let formattedObj = { 
      name: presentationData.name, 
      id: presentationData.id, 
      label: presentationData.label,
      fields: presentationData.fields
    }
    let primaryKeyFieldIds = []
    _.each(presentationData.fields, (value, key) => {
      if (_.isMatch(value, {isPrimaryKey: true})) primaryKeyFieldIds.push(key)
    })
    let retDataObj = {}
    if (presentationData.data) {
      presentationData.data.forEach( (dataRow) => {
        _.each(dataRow, (value,key) => {
          if (_.contains(primaryKeyFieldIds, key)) {
            retDataObj[value] = _.extend(retDataObj[value], dataRow)
          }
        })
      })
    }
    formattedObj.data = retDataObj
    return formattedObj
  }

  
}
const datasets = DataSets.getProxy()
export {DataSets as default, datasets, FieldUtils}