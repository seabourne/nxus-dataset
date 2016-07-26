'use strict';

import {BaseModel} from 'nxus-storage'

module.exports = BaseModel.extend({
  identity: 'datarow',
  dataset: {
    model: 'dataset'
  }
});
