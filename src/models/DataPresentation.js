'use strict';

import {BaseModel} from 'nxus-storage'
import _ from 'underscore'

module.exports = BaseModel.extend({
  identity: 'datapresentation',
  attributes: {
    name: 'string',
    fieldIds: {
      type: 'array',
      defaultsTo: []
    },
    label: 'string',
    //data preparation helper
    selectFieldsFromSet: (datasets) => {
      let myInstanceObj = this.toObject();
      let matchedFields = [];
      _.each(myInstanceObj.fieldIds, (fieldId) => {
        let datasetFields = _.flatten(_.pluck(datasets, "fields"));
        let mField = _.findWhere(datasetFields, {id:fieldId})
        matchedFields.push(mField)
      })
      return matchedFields
    }
  }
});