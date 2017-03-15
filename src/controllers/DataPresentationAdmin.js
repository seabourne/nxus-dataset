import {AdminController} from 'nxus-admin'
import {templater} from 'nxus-templater'
import {actions} from 'nxus-web'
import {router} from 'nxus-router'
import _ from 'underscore'
import {Promise} from 'bluebird'

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
      instanceTitleField: 'Data Presentation',
      displayName: 'Data Presentations',
      paginationOptions:  {
        sortField: 'name',
        sortDirection: 'ASC',
        itemsPerPage: 15,
      },
      ...opts
    })
    this.peerModelIdentity = opts.peerModelIdentity || 'datasets-dataset'
    //override defaults for edit and create form template
    templater.replace().template(__dirname+'/../templates/datasets-datapresentation-form.ejs', this.pageTemplate, this.templatePrefix+'-edit')
    templater.replace().template(__dirname+'/../templates/datasets-datapresentation-form.ejs', this.pageTemplate, this.templatePrefix+'-create')
    //override default list template
    templater.replace().template(__dirname+'/../templates/datasets-datapresentation-list.ejs', this.pageTemplate, this.templatePrefix+'-list')
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
   * Override the default ViewController list action,
   * to include DataSet field info with the listing page
   * for DataPresentations.
   * See nxus-web ViewController for the super implementation notes.
   */
  list(req, res, query) {
    return Promise.all([query,this.models[this.peerModelIdentity].find()])
    .spread( ( presentations, datasets) => {
      return {
        presentations,
        datasets,
        }
    })
  }

  /**
   * Implements save for a DataPresentation, 
   * from "datasets-datapresentation-form".
   * Redirects to the proper page depending on outcome.
   * @param  {Request} req   
   * @param  {Response} res  
   */
  save(req, res) {
    let presentId = req.params.id || null
    let updatedObj = { 
      name: req.body.name, 
      label: req.body.label, 
      subheading: req.body.subheading,
      fields: [],
    }
    if (req.body.fieldIds) {
      let fieldsArr = []
      req.body.fieldIds.forEach( (ident) => {
        let field = { id: ident, label: req.body['fieldLabel' + ident]}
        fieldsArr.push(field)
      })
      updatedObj.fields = fieldsArr
    }
    this.log.debug('save presentation id: ', presentId)
    return Promise.resolve().then( () => {
      if (presentId) {
        return this.model.update({id: presentId}, updatedObj)
      } else {
        return this.model.create(updatedObj)
      }
    }).then( () => {
        return res.redirect(this.routePrefix)
    }).catch((err) => {
      this.log.error('datapresentation save error, id: ', presentId, ' at: ', err.stack);
      req.flash('error', 'Error saving: ' + err)
      return res.redirect(this.routePrefix)
    })
  }

  /**
   * Set up the create-new form for DataPresenation.
   * Loads `peerModelIdentity` objects for use in a pick-list of field Id's.
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