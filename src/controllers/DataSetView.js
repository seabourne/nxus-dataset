import {ViewController} from 'nxus-web'
import {templater} from 'nxus-templater'
import morph from 'morph'

/**
 * View pages for list and detail of a DataSet and its associated DataRow's
 */
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
        pagination: {pageLength: 50},
        scripts: ['//cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js',
          '//cdn.datatables.net/buttons/1.2.4/js/dataTables.buttons.min.js',
          '//cdn.datatables.net/buttons/1.2.4/js/buttons.html5.min.js'],
        styles: ['//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css',
          '//cdn.datatables.net/buttons/1.2.4/css/buttons.dataTables.min.css'],
        ...context,
      }
      return retObj
    })
  }

  modelNames() {
    return [ 'datasets-dataset', 'datasets-datarow' ]
  }
}