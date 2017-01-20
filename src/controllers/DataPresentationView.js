import {ViewController} from 'nxus-web'
import {templater} from 'nxus-templater'
import {datasets, dataPresentationUtil} from '../index'
import _ from 'underscore'
/**
 * View detail and listings for data presentations
 */
export default class DataPresentationView extends ViewController {

  constructor() {
    super({
     modelIdentity: 'datasets-datapresentation',
      displayName: 'Data for Presentation',
      ignoreFields: ['id', 'createdAt', 'updatedAt', 'fieldIds'],
      paginationOptions:  {
        sortField: 'name',
        sortDirection: 'ASC',
        itemsPerPage: 10,
      },
    })
    templater.replace().template(__dirname+ '/../templates/datasets-datapresentation-view-detail.ejs', this.pageTemplate, this.templatePrefix+'-detail')
    this.paginationDetailList = {pageLength: 50}
  }

  /**
   * Detail view of the datasets and datarows 
   * assigned to a presentation.
   * Overrides ViewController's `detail(req,res,query)` method.
   */
  detail(req, res, query) {
    return datasets.loadPresentations({id: req.params.id})
    .then( (data) => {
      if (! data || 0 == data.length) {
        throw new Error("Presentation Not Found")
      }
      let datasetIds = _.pluck(_.values(data[0].fields), 'dataset')
      return([data[0], this.models['datasets-dataset'].find({id: datasetIds})])
    }).spread( (presentationFound, datasets) => {
      /*
       * Data presentations without primary keys joining the data rows are 
       * displayed as a flattened single object of all row data.
       */
      if (_.findWhere(_.values(presentationFound.fields), {isPrimaryKey: true})) {
        //combine datarows from multiple datasets, indexed by PK value
        presentationFound = dataPresentationUtil.indexDataIntoObjectByPrimaryKeyValue(presentationFound)
      } else {
        //flatten the array of objects in presentation's data into a single object
        presentationFound.data = Object.assign({}, ...presentationFound.data)
      }
      //return includes support for DataTables & buttons plugin therein
      let retObj = {
        dataPresentation: presentationFound,
        dataSources: _.pluck(datasets, 'source'),
        pagination: this.paginationDetailList,
        scripts: ['//cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js',
          '//cdn.datatables.net/buttons/1.2.4/js/dataTables.buttons.min.js',
          '//cdn.datatables.net/buttons/1.2.4/js/buttons.html5.min.js'],
        styles: ['//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css',
          '//cdn.datatables.net/buttons/1.2.4/css/buttons.dataTables.min.css'],
      }
      return retObj
    }).catch( (err) => {
       this.log.debug(err, ' error with id: ', req.params.id )
      return {}
    })
  }

  modelNames() {
    return ['datasets-datapresentation', 'datasets-dataset']
  }
}