'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')

/**
 * @module CouponController
 * @description Generated Trails.js Controller.
 */
module.exports = class CouponController extends Controller {
  generalStats(req, res) {
    res.json({})
  }

  /**
   *
   * @param req
   * @param res
   */
  findById(req, res) {
    const orm = this.app.orm
    const Coupon = orm['Coupon']
    let id = req.params.id
    if (!id && req.coupon) {
      id = req.coupon.id
    }
    Coupon.findById(id, {})
      .then(coupon => {
        if (!coupon) {
          throw new Errors.FoundError(Error(`Coupon id ${id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, coupon)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  findAll(req, res) {
    const orm = this.app.orm
    const Coupon = orm['Coupon']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Coupon.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(coupons => {
        this.app.services.ProxyEngineService.paginate(res, coupons.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, coupons.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  create(req, res) {
    const CouponService = this.app.services.CouponService
    lib.Validator.validateCoupon.create(req.body)
      .then(values => {
        return CouponService.create(req.body)
      })
      .then(coupon => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, coupon)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  update(req, res) {
    const CouponService = this.app.services.CouponService
    lib.Validator.validateCoupon.update(req.body)
      .then(values => {
        return CouponService.update(req.body)
      })
      .then(coupon => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, coupon)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  destroy(req, res) {
    const CouponService = this.app.services.CouponService
    lib.Validator.validateCoupon.destroy(req.body)
      .then(values => {
        return CouponService.destroy(req.body)
      })
      .then(coupon => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, coupon)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

