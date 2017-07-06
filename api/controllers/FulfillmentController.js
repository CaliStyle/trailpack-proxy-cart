'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')

/**
 * @module FulfillmentController
 * @description Fulfillment Controller.
 */
module.exports = class FulfillmentController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  findById(req, res) {
    const Fulfillment = this.app.orm['Fulfillment']
    const id = req.params.id

    Fulfillment.findByIdDefault(id, {})
      .then(fulfillment => {
        if (!fulfillment) {
          throw new Errors.FoundError(Error(`Fulfillment id ${id} not found`))
        }
        return res.json(fulfillment)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  findAll(req, res) {

  }
  create(req, res) {
    // TODO
  }
  update(req, res) {
    // TODO
  }
  destroy(req, res) {
    // TODO
  }
}

