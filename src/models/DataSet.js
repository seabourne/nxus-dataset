import {BaseModel} from 'nxus-storage'

export default BaseModel.extend({
  identity: 'datasets-dataset',
  attributes: {
    name: 'string',
    fields: 'json',
    source: 'string',
    description: 'text',
    rowCount: 'integer'
  }
})