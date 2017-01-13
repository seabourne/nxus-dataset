import {ViewController} from 'nxus-web'
import {templater} from 'nxus-templater'
import {DataSets} from '../index'
export default class DataPresentationView extends ViewController {

  constructor() {
    super({
     modelIdentity: 'datasets-datapresentation',
      displayName: 'Data',
    })
// ttemplate: datasets-datapresentation-view-data
  }

  detail(req, res, query) {
    return DataSets.loadPresentations( {id: req.params.id})
    .then( (data) => {
      let retObj = {
        data: data.data,
        fields: data.fields,
      }
      return retObj
    })
  }

}