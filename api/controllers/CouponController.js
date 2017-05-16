'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')

/**
 * @module CouponController
 * @description Generated Trails.js Controller.
 */
module.exports = class CouponController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  findById(req, res) {

  }
  findAll(req, res) {

  }
  create(req, res) {
    const CouponService = this.app.services.CouponService
    lib.Validator.validateCoupon.create(req.body)
      .then(values => {
        return CouponService.create(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  update(req, res) {
    const CouponService = this.app.services.CouponService
    lib.Validator.validateCoupon.update(req.body)
      .then(values => {
        return CouponService.update(req.body)
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

