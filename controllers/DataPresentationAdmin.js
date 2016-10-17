import {AdminController} from 'nxus-admin'
import {templater} from 'nxus-templater'
import {actions} from 'nxus-web'
import {router} from 'nxus-router'
import _ from 'underscore'

import * as field from '../fieldConstants'

export default class DataPresentationAdmin extends AdminController {
  constructor() {
    super({
      modelIdentity: 'datasets-datapresentation',
      instanceTitleField: 'DataPresentation'
    })
    //custom datapresentation edit and create form template
    templater.replace().template(__dirname+"/../templates/datasets-datapresentation-form.ejs", this.pageTemplate, this.templatePrefix+"-edit")
    templater.replace().template(__dirname+"/../templates/datasets-datapresentation-form.ejs", this.pageTemplate, this.templatePrefix+"-create")
  }


  edit(req, res, query) {
    return super.edit(req, res, query)
    .then( (editContext) => {
      let instance = editContext.object
      this.log.debug( "editing datapresentation id:  ", instance.id)
      return [this.models['datasets-dataset'].find(), editContext]
    }).spread( (datasets, context) => {
      this.log.debug( "edit handling datasets  ", _.pluck(datasets, "id"))
      let retObj = {
        datasets: datasets,
        ...context
      }
      this.log.debug( "returning datapresentation edit context:  ", retObj)
      return retObj
    })
  }

  save(req, res) {
    let presentId = req.params.id
    this.log.debug("save presentation id: ", presentId)
    this.log.debug(" body: ", req.body.fieldIds)
    if (presentId) {
      this.model.findOne(presentId)
      .then( (presentation) => {
        presentation.name = req.body.name
        presentation.label = req.body.label
        presentation.fieldIds = req.body.fieldIds
        return presentation.save().catch( (err) => {
          this.log.error("nxus-dataset: presentation update failed on " + presentId, err.stack)
          return res.redirect(this.routePrefix)
        }).then( () => {
          return res.redirect(this.routePrefix)
        })
      })
    } else {
      return this.model.create({name: req.body.name, label: req.body.label, fieldIds: req.body.fieldIds})
      .then( (newRecord) =>{
        this.log.debug("presentation created ", newRecord.id)
        return res.redirect(this.routePrefix)
      })
    }
  }

  create(req, res, object) {
    return this.models['datasets-dataset'].find().then( (datasets) => {
      return {title: "Create " + this.displayName, object, datasets}
    })
    
  }

  modelNames() {
    return [ 'datasets-datapresentation', 'datasets-dataset']
  }
}