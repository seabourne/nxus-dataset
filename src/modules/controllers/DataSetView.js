import {ViewController} from 'nxus-web'
import {templater} from 'nxus-templater'
import morph from 'morph'

export default class DataSetView extends ViewController {

  constructor() {
    super({
     modelIdentity: 'datasets-dataset',
      displayName: 'Data',
      ignoreFields: ['id', 'fields', 'createdAt', 'updatedAt' ],
    })

    templater.replace().template(__dirname+ '/../templates/datasets-dataset-detail.ejs', this.pageTemplate, this.templatePrefix+'-detail')
  }

  detail(req, res, query) {
    return super.detail(req, res, query).then( (ctx) => {
      return [this.models['datasets-datarow'].find({dataset: ctx.object.id}), ctx]
    }).spread( (datarows, context) => {
      let retObj = {
        datarows: datarows,
        morph: morph,
        rows: datarows,
        fields: (context.object.fields ? context.object.fields : []),
        ...context
      }
      return retObj
    })
  }

  modelNames() {
    return [ 'datasets-dataset', 'datasets-datarow' ]
  }
}