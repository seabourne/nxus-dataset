'use strict';

import {BaseModel} from 'nxus-storage'
import _ from 'underscore'

var DataPresentation = BaseModel.extend({
  identity: 'datasets-datapresentation',
  attributes: {
    name: 'string',
    fields: 'json',
    label: 'string',
    subheading: 'string',
  }
});

module.exports = DataPresentation;
