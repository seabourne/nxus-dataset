import {storage} from 'nxus-storage'
import {MVCModule} from 'nxus-web'
import _ from 'underscore'
import {Promise} from 'bluebird'

import {FieldUtils} from './fieldUtils'
import DataPresentationUtil from './DataPresentationUtil'

class DataSets extends MVCModule {
  constructor () {
    super()
    this.dataPresentationUtil = new DataPresentationUtil()
  }
  /**
   * Gather DataPresentation objects returned by the given query,
   * returning normalized data for each in an arry
   * @param  {Object} query WaterLine query on DataPresentation model
   * @return {arry of objects}       each object in the array is the full data for one of the queried presentations, 
   * returned in the format provided by `extractDataForPresentation()`
   */
  loadPresentations(query) {
    return this.models['datasets-datapresentation'].find(query)
    .then( (presentations) => {
      let allPresentationsFieldIds = _.flatten(_.pluck(presentations, 'fieldIds'))
      this.log.debug( "got presentations ids: ", _.pluck(presentations, 'id'), " concated all field ids ", allPresentationsFieldIds )
      return([presentations, this.models['datasets-dataset'].find({'fields.id': allPresentationsFieldIds})])
    }).spread( (presentations, dataSets) => {
      return([presentations, dataSets, this.models['datasets-datarow'].find({dataset: _.pluck(dataSets, 'id')})])
    }).spread( (presentations, dataSets, dataRows) => {
      if (presentations) {
        let extractedDataArr = []
        presentations.forEach( (present) => {
          let presentData = this.dataPresentationUtil.extractDataForPresentation(present, dataSets, dataRows)
          extractedDataArr.push(presentData)
       })
       return extractedDataArr
      } else {
        return []
      }
    })
  }

  loadPresentationByName(name) {
    return loadPresentations({name: name})
  }

  
}
const datasets = DataSets.getProxy()
const dataPresentationUtil = new DataPresentationUtil();
export {DataSets as default, datasets, FieldUtils, dataPresentationUtil}