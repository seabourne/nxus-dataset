import {AdminController} from 'nxus-admin'
import {templater} from 'nxus-templater'
import {actions} from 'nxus-web'
import {router} from 'nxus-router'
import _ from 'underscore'

/**
 * Admin for a DataPresentatation model `datasets-datapresentation`:
 * extends nxus-web's AdminController.
 * 
 *  # Parameters
 *  Options properites for constructor:
 *   * `peerModelIdentity` - selects the model which holds definition of `fields`; defaults to `datasets-dataset`
 */
export default class DataPresentationAdmin extends AdminController {
  constructor(opts={}) {
    super({
      modelIdentity: 'datasets-datapresentation',
      instanceTitleField: 'DataPresentation',
      ...opts
    })
    this.peerModelIdentity = opts.peerModelIdentity || 'datasets-dataset'
    //override defaults for edit and create form template
    templater.replace().template(__dirname+'/../templates/datasetsDatapresentationForm.ejs', this.pageTemplate, this.templatePrefix+'-edit')
    templater.replace().template(__dirname+'/../templates/datasetsDatapresentationForm.ejs', this.pageTemplate, this.templatePrefix+'-create')
  }

  /**
   * Implements edit page preparation, adding all available stored instances of 
   * the `peerModelIdentity` for use in pick-list of field ID's for this presentation.
   * @param  {Request} req   
   * @param  {Response} res   
   * @param  {Waterline Query object} query from superclass
   * @return {Object}       template data object
   */
  edit(req, res, query) {
    return super.edit(req, res, query)
    .then( (editContext) => {
      let instance = editContext.object
      this.log.debug('editing datapresentation id:  ', instance.id)
      return [this.models[this.peerModelIdentity].find(), editContext]
    }).spread( (datasets, context) => {
      let retObj = {
        datasets: datasets,
        ...context
      }
      return retObj
    })
  }

  /**
   * Implements save for a DataPresentation, from custom form.
   * Redirects to the proper page depending on outcome.
   * @param  {Request} req   
   * @param  {Response} res  
   */
  save(req, res) {
    let presentId = req.params.id || null
    this.log.debug('save presentation id: ', presentId)
    this.model.createOrUpdate({id: presentId}, { 
      name: req.body.name, 
      label: req.body.label, 
      fieldIds: req.body.fieldIds} ).then( () => {
        return res.redirect(this.routePrefix)
    }).catch((err) => {
      this.log.error('datapresentation save error, id: ', presentId, ' at: ', err.stack);
      req.flash('error', 'Error saving: ' + err)
      return res.redirect(this.routePrefix)
    })
  }

  /**
   * Set up the create-new form for DataPresenation.
   * Loads `peerModelIdentity` objects for use in a pick-list of fieldId's.
   * @param  {[type]} req    [description]
   * @param  {[type]} res    [description]
   * @param  {[type]} object [description]
   * @return {[type]}        [description]
   */
  create(req, res, object) {
    return this.models[this.peerModelIdentity].find().then( (datasets) => {
      return {title: 'Create ' + this.displayName, object, datasets}
    })
    
  }

  modelNames() {
    return [ 'datasets-datapresentation', this.peerModelIdentity]
  }
}