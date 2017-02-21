//utility methods
'use strict';

import _ from 'underscore'
/**
 * Utility methods for extracting and formatting data returned by raw queries,
 * and for converting between various representations of that data.
 */
export default class DataPresentationUtil {
  constructor(opts={}) {

  }

  /**
   * 
   * Extract data relevant to the DataPresentation from collections of DataSet's and DataRow's.
   * Creates a normalized DataPresentation data-object, with header info from the presentation and all matching DataRows trimmed to just the fields needed.
   * @param  {DataPresentation} presentation 
   * @param  {collection of DataSet} datasets     DataSets that span the field-id's in the supplied presentation. Can be a super-set.
   * @param  {collection of DataRow} datarows     [description]
   * @return {Object}    with properties:
   * *  `name` - name of the presentation;
   * *  `id` - ID of the presentation;
   * *  `label` - label of the presentation;
   * *  `fields` - object indexed by the presentation field-ids, also including any referenced DataSet primary key fields;
   *    values are the field data from DataSet. See {@link DataPresentationUtil#createFieldsIndexedById}.
   * *  `data` - array of DataRow records, transformed to use the unique field-id's as property names. 
   *   Records hold only values that are selected in the presentation, plus any defined primary-key fields. See createDataRowsForFields.
   */
  extractDataForPresentation(presentation, datasets, datarows) {
    let presentationData = { 
      name: presentation.name, 
      id: presentation.id, 
      label: presentation.label, 
      fields: this.createFieldsIndexedById(presentation.fieldIds, datasets, datarows), 
      data: this.createDataRowsForFields(presentation.fieldIds, datasets, datarows)
    }
    return presentationData
  }


  /**
   * Create list of data objects, with properties set to the field-id's to prevent naming conflicts.
   * The returned data will include just these field values, along with any fields marked isPrimaryKey=true
   * @param  {Array} fieldIdList the field-id values to filter from supplied datasets & datarows
   * @param  {Array} datasets    DataSet objects, containing a 'fields' property which holds field object
   * @param  {[type]} datarows   DataRow objects to filter
   * @return {Array}             Transformed DataRow objects, with properties set to the field-id's.
   */
  createDataRowsForFields(fieldIdList, datasets, datarows) {
    let retDataRows = []
    fieldIdList.forEach( (fieldId) => {
      let targetField = {}
      let dataset = datasets.find((set) => { 
        targetField = _.findWhere(set.fields, {id:fieldId})
        return targetField
      })
      if (targetField && targetField.name) {
        let primaryKeyFields = _.where(dataset.fields, {isPrimaryKey: true})
        datarows.forEach( (row, index) => {
          if (dataset.id == row.dataset && _.has(row, targetField.name)) {
            let retRow = {}
            retRow[targetField.id] = row[targetField.name]
            if (primaryKeyFields) {
              primaryKeyFields.forEach( (keyField) => {
                retRow[keyField.id] = row[keyField.name]
              })
            }
            if (retRow) retDataRows.push(retRow)
          }
        })
      }
    })
    return retDataRows
  }

  /**
   * Pull field info for fields matching the field-id's in the supplied fieldIdList,
   * and reformat into an object indexed by those field-id's.
   * @param  {Array} fieldIdList the field-id's to select
   * @param  {Array} datasets    array of DataSet objects holding fields, with name, id, etc.
   * @param  {Array} datarows    
   * @return {Object}            field information from DataSet, indexed by field-id. Each field-id holds
   * an object with properties:
   *  -  `name` the original column name uploaded into the referenced DataSet
   *  -  `id` unique ID for the field
   *  -  `label` readable label for display
   *  -  `type` one of {@module ./fieldUtils#FIELD_TYPES}
   *  -  `isPrimaryKey` boolean `true` if this is designated primary key
   *  -  `isVisible` boolean hint to display pages whether to show this in rendered data listings
   *  -  `dataset` ID of the DataSet for this field
   */
  createFieldsIndexedById(fieldIdList, datasets, datarows) {
    let fieldsObj = {}
    let matchedDataSetFields = []
    datasets.forEach( (dataset) => {
      let dsMatched = _.map(dataset.fields, (dsFieldObj) => {
        if (fieldIdList.includes(dsFieldObj.id) || dsFieldObj.isPrimaryKey)
          return _.extend(_.clone(dsFieldObj), {dataset: dataset.id})
      })
      matchedDataSetFields = matchedDataSetFields.concat(dsMatched)
    })
    matchedDataSetFields = _.compact(matchedDataSetFields)
    matchedDataSetFields.forEach( (field) => {
      fieldsObj[field.id] = field
    })
    return fieldsObj
  }

  /**
   * reformat array of presentationData objects
   * @param  {Object} presentationData objects per extractDataForPresentation()
   * @return {Array}                  array of (new) presentationData objects where
   *  the normalized rows in each presentationData.data
   *  have properties set to the field label. See {@link DataPresentationUtil#formatDataWithFieldLabel}.
   */
  formatPresentationDataByFieldLabel(presentationData) {
    if (_.isArray(presentationData)) {
      return _.map(presentationData, this.formatDataWithFieldLabel)
    } else {
      return this.formatDataWithFieldLabel(presentationData)
    }
  }

  /**
   *  reformat presentationData.data
   * @param  {Object} presentationData per {@link DataPresentationUtil#extractDataForPresentation}
   * @return {Object}                  a new copy of presentationData with `data` property 
   *   transformed into rows with property keys set to the field label.
   */
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
        let newRow = {}
        _.keys(dataRow).forEach( (key) => {
          let fieldInfo = presentationData.fields[key]
          if (fieldInfo && fieldInfo.label) newRow[fieldInfo.label] = dataRow[key]
        })
        if (! _.isEmpty(newRow)) byNameData.push(newRow)
      })
    }
    formattedObj.data = byNameData
    return formattedObj
  }

  /**
   * reformat array of presentation data using indexDataIntoObjectByPrimaryKeyValue()
   * @param  {Array} presentationData objects in normalized form per {@link DataPresentationUtil#extractDataForPresentation}
   * @return {Array} formatted according to {@link DataPresentationUtil#indexDataIntoObjectByPrimaryKeyValue}     
   */
  indexPresentationDataByPrimaryKeyValue(presentationData) {
    if (_.isArray(presentationData)) {
      return _.map(presentationData, this.indexDataIntoObjectByPrimaryKeyValue)
    } else {
      return this.indexDataIntoObjectByPrimaryKeyValue(presentationData)
    }
  }

  /**
   * reformat the 'data' rows in the supplied presentation data into a single
   * object with properties set to the value of primary key field in each row.
   * @param  {Object} presentationData per {@link DataPresentationUtil#extractDataForPresentation}
   * @return {Object} presentationData with `data` property transformed into a single object,
   *  with keys of each distinct primary key value, grouping all data for that primary key value.
   */
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
            if (!retDataObj[value]) retDataObj[value] = {}
            retDataObj[value] = _.extend(retDataObj[value], dataRow)
          }
        })
      })
    }
    formattedObj.data = retDataObj
    return formattedObj
  }
}