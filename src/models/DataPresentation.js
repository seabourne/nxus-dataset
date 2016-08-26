'use strict';

import {BaseModel} from 'nxus-storage'
import _ from 'underscore'

var DataPresentation = BaseModel.extend({
  identity: 'datapresentation',
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
      return DataPresentation.extractUsingFieldIds(myInstanceObj.fieldIds, datasets, datarows)
    }
  }
});

DataPresentation.extractUsingFieldIds = (fieldIds, datasets, datarows) => {
    let presentationDataArray = [];
      _.each(fieldIds, (fieldId) => {
        let presentationData = {}
        let dataset = _.find(datasets, (set) => { 
          return _.findWhere(set.fields, {id:fieldId})
        })
        if (dataset) {
          console.log("dataset ", dataset, " for presentation field id ", fieldId)
          let valueField = _.findWhere(dataset.fields, {id:fieldId})
          if (valueField) {
            let primaryKeyField = _.findWhere(dataset.fields, {primaryKey: true})
            presentationData.field = valueField
            presentationData.data = {}
            let matchedRows = _.filter(datarows, (row) => {
              return _.has(row, valueField.name)
            })
            _.each(matchedRows, (row, index) => {
              if (primaryKeyField) {
                presentationData.data[matchedRows[primaryKeyField.name]] = matchedRows[valueField.name]
              } else {
                presentationData.data[index] = matchedRows[valueField.name]
              }
              presentationDataArray.push(presentationData)
            })
          } else {
            //do something here?
          }
        }

      })
      return presentationDataArray
  }

module.exports = DataPresentation;
