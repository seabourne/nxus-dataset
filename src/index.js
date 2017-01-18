import {storage} from 'nxus-storage'
import {MVCModule} from 'nxus-web'
import _ from 'underscore'
import {Promise} from 'bluebird'

import {FieldUtils} from './fieldUtils'
import DataPresentationUtil from './DataPresentationUtil'

const DATASET_MODEL_DEFAULT = 'datasets-dataset'
const DATAROW_MODEL_DEFAULT = 'datasets-datarow'

class DataSets extends MVCModule {
  constructor (opts={}) {
    super()
    this.dataPresentationUtil = new DataPresentationUtil()
    this.dataSetModel = opts.dataSetModel || DATASET_MODEL_DEFAULT
    this.dataRowModel = opts.dataRowModel || DATAROW_MODEL_DEFAULT
  }
  /**
   * Gather DataPresentation objects returned by the given query,
   * returning normalized data for each in an arry
   * @param  {Object} query WaterLine query on DataPresentation model
   * @param { Array of, or single, string} rowKeyValues optional primary key value(s) to filter the resulting rows that are returned in the "data" property
   * @param  {Object} queryOptions Waterline query options, such as `sort`, `limit`, etc.
   * @return {arry of objects}       each object in the array is the full data for one of the queried presentations, 
   * returned in the format provided by `DataPresentationUtil.extractDataForPresentation()`
   */
  loadPresentations(query, rowKeyValues, queryOptions) {
    return this.models['datasets-datapresentation'].find(query)
    .then( (presentations) => {
      let allPresentationsFieldIds = _.flatten(_.pluck(presentations, 'fieldIds'))
      return([presentations, this.models[this.dataSetModel].find({'fields.id': allPresentationsFieldIds})])
    }).spread( (presentations, dataSets) => {
      if (!dataSets) return ([presentations, dataSets, []])
      let rowQuery = this._buildRowQuery(dataSets, rowKeyValues)
      return([presentations, dataSets, this.models[this.dataRowModel].find(rowQuery)])
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

  /**
   * Convenience method to load a presentation by name.
   * @param  {String} name         name of a data presentation, for exact match.
   * @param  {Object} queryOptions Waterline query options, such as `sort`, `limit`, etc.
   * @return {array of Object}              see return value for `loadPresentations`
   */
  loadPresentationByName(name, queryOptions) {
    return loadPresentations({name: name})
  }

  /**
   * Load data for the supplied list of fields. If 'rowKeyValues' is supplied then limit returned data to 
   * primary key rows with that value or values.
   * @param  {Array of field-id's} fields 
   * @return {Object}        Has just the 'data' and 'fields' properties per `loadPresentations()`
   */
  loadFields(fields, rowKeyValues, queryOptions) {
    if (_.isEmpty(fields)) {
      return {}
    }
    return this.models['datasets-dataset'].find({'fields.id': fields})
    .then( (dataSets) => {
      if (!dataSets) return ([[], []])
      let rowQuery = this._buildRowQuery(dataSets, rowKeyValues, queryOptions)
      return([dataSets, this.models['datasets-datarow'].find(rowQuery)])
    }).spread( (dataSets, dataRows) => {
      let retObj = {
        data: this.dataPresentationUtil.createDataRowsForFields(fields, dataSets, dataRows),
        fields: this.dataPresentationUtil.createFieldsIndexedById(fields, dataSets, dataRows)
      }
      return retObj
    })
  }

  _buildRowQuery(datasets, keyValues, queryOptions) {
    let rowQuery = {dataset: _.pluck(datasets, 'id')}
    if (keyValues || (Array.isArray(keyValues) && 0 < keyValues.length)) {
      delete rowQuery.dataset
      rowQuery.or = []
      datasets.forEach( (ds) => {
        let orClause = {'dataset': ds.id}
        _.each(_.where(ds.fields, {isPrimaryKey:true}), (pkField) => {
          orClause[pkField.name] = keyValues
        })
        rowQuery.or.push(orClause)
      })
    }
    if (queryOptions) {
      rowQuery = {where: rowQuery}
      rowQuery = Object.assign(rowQuery, queryOptions)
    }
    return rowQuery
  }

  
}
const datasets = DataSets.getProxy()
const dataPresentationUtil = new DataPresentationUtil();
export {DataSets as default, datasets, FieldUtils, dataPresentationUtil}
