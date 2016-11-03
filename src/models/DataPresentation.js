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
    label: 'string'
  }
});


module.exports = DataPresentation;
