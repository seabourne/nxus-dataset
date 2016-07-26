'use strict';

import {BaseModel} from 'nxus-storage'

module.exports = BaseModel.extend({
  identity: 'dataset',
  attributes: {
    name: 'string',
    fields: 'json',
    source: 'string',
    description: 'text',
    rowCount: 'integer'
  }
});
