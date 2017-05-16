'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')

/**
 * @module DiscountController
 * @description Generated Trails.js Controller.
 */
module.exports = class DiscountController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  findById(req, res) {

  }
  findAll(req, res) {

  }
  create(req, res) {
    const DiscountService = this.app.services.DiscountService
    lib.Validator.validateDiscount.create(req.body)
      .then(values => {
        return DiscountService.create(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  update(req, res) {
    const DiscountService = this.app.services.DiscountService
    lib.Validator.validateDiscount.update(req.body)
      .then(values => {
        return DiscountService.update(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  destroy(req, res) {

  }
}

