'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')

/**
 * @module DiscountController
 * @description Generated Trails.js Controller.
 */
module.exports = class DiscountController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  findById(req, res) {
    const orm = this.app.orm
    const Discount = orm['Discount']
    let id = req.params.id
    if (!id && req.discount) {
      id = req.discount.id
    }
    Discount.findById(id, {})
      .then(discount => {
        if (!discount) {
          throw new Errors.FoundError(Error(`Discount id ${id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  findAll(req, res) {
    const orm = this.app.orm
    const Discount = orm['Discount']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Discount.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(discounts => {
        this.app.services.ProxyEngineService.paginate(res, discounts.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discounts.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  create(req, res) {
    const DiscountService = this.app.services.DiscountService
    lib.Validator.validateDiscount.create(req.body)
      .then(values => {
        return DiscountService.create(req.body)
      })
      .then(discount => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
      })
      .then(result => {
        return res.json(result)
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
      .then(discount => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  destroy(req, res) {
    const DiscountService = this.app.services.DiscountService
    lib.Validator.validateDiscount.destroy(req.body)
      .then(values => {
        return DiscountService.destroy(req.body)
      })
      .then(discount => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

