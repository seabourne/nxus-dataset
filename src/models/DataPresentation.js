'use strict';

import {BaseModel} from 'nxus-storage'
import _ from 'underscore'

var DataPresentation = BaseModel.extend({
  identity: 'datasets-datapresentation',
  attributes: {
    name: 'string',
    fieldIds: {
      type: 'array',
      defaultsTo: []
    },
    label: 'string',
    //data preparation helper
    extractFieldData: (datasets, datarows) => {
      let myInstanceObj = this.toObject();
      return DataPresentation.extractUsingFieldIds(myInstanceObj, datasets, datarows)
    }
  }
});

/**
 * Extract data relevant to the DataPresentation from collections of DataSet's and DataRow's.
 * Creates a filtered view object, with summary data about the presentation and all matching DataRows trimmed to just the fields needed.
 * @param  {[DataPresentation]} presentation 
 * @param  {[collection of DataSet]} datasets     DataSets that span the field-id's in the supplied presentation. Can be a super-set.
 * @param  {[collection of DataRow]} datarows     [description]
 * @return {[Object]}    with properties:
 *   name - name of the presentation;
 *   id - ID of the presentation;
 *   label - label of the presentation;
 *   fields - array of matching fields extracted from DataSet(s);
 *   data - array of DataRow records, holding just the identified fields and any primary key fields.
 */
DataPresentation.extractUsingFieldIds = (presentation, datasets, datarows) => {
  let presentationData = { 
    name: presentation.name, 
    id: presentation.id, 
    label: presentation.label, 
    fields: [], 
    data: []
  }
  presentation.fieldIds.forEach( (fieldId) => {
    let targetField = {}
    let dataset = datasets.find((set) => { 
      targetField = _.findWhere(set.fields, {id:fieldId})
      return targetField
    })
    if (targetField && targetField.name) {
        let primaryKeyFields = _.where(dataset.fields, {primaryKey: true})
        presentationData.fields.push(targetField)
        datarows.forEach( (row, index) => {
          if (dataset.id == row.dataset && _.has(row, targetField.name)) {
            let pRow = {}
            pRow[targetField.name] = row[targetField.name]
            pRow.fieldId = targetField.id
            if (primaryKeyFields) {
              primaryKeyFields.forEach( (keyField) => {
                pRow[keyField.name] = row[keyField.name]
              })
            }
            presentationData.data.push(pRow)
          }

        })
    }
  })
  return presentationData
}

module.exports = DataPresentation;
