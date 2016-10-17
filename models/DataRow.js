
import {BaseModel} from 'nxus-storage'

module.exports = BaseModel.extend({
  identity: 'datasets-datarow',
  dataset: {
    model: 'datasets-dataset'
  }
});