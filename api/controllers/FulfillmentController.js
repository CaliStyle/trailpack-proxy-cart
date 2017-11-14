'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')
const lib = require('../../lib')

/**
 * @module FulfillmentController
 * @description Fulfillment Controller.
 */
module.exports = class FulfillmentController extends Controller {
  /**
   *
   * @param req
   * @param res
   */
  generalStats(req, res) {
    res.json({})
  }

  /**
   * Find One By ID
   * @param req
   * @param res
   */
  findById(req, res) {
    const Fulfillment = this.app.orm['Fulfillment']
    const id = req.params.id

    Fulfillment.findByIdDefault(id, {})
      .then(fulfillment => {
        if (!fulfillment) {
          throw new Errors.FoundError(Error(`Fulfillment id ${id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, fulfillment)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   * Count the amount of fulfillments
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Fulfillment')
      .then(count => {
        const counts = {
          fulfillments: count
        }
        return res.json(counts)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Find All Fulfillments
   * @param req
   * @param res
   */
  findAll(req, res) {
    const orm = this.app.orm
    const Fulfillment = orm['Fulfillment']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Fulfillment.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(fulfillments => {
        this.app.services.ProxyEngineService.paginate(res, fulfillments.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, fulfillments.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Create Fulfillment
   * @param req
   * @param res
   */
  create(req, res) {
    const FulfillmentService = this.app.services.FulfillmentService
    lib.Validator.validateFulfillment.create(req.body)
      .then(values => {
        req.body.id = req.params.id
        return FulfillmentService.create(req.body)
      })
      .then(fulfillment => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, fulfillment)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Update Fulfillment
   * @param req
   * @param res
   */
  update(req, res) {
    const FulfillmentService = this.app.services.FulfillmentService
    lib.Validator.validateFulfillment.update(req.body)
      .then(values => {
        req.body.id = req.params.id
        return FulfillmentService.update(req.body)
      })
      .then(fulfillment => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, fulfillment)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Cancel Fulfillment
   * @param req
   * @param res
   */
  cancel(req, res) {
    const FulfillmentService = this.app.services.FulfillmentService
    lib.Validator.validateFulfillment.cancel(req.body)
      .then(values => {
        req.body.id = req.params.id
        return FulfillmentService.cancel(req.body)
      })
      .then(fulfillment => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, fulfillment)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Destroy Fulfillment
   * @param req
   * @param res
   */
  destroy(req, res) {
    const FulfillmentService = this.app.services.FulfillmentService
    lib.Validator.validateFulfillment.destroy(req.body)
      .then(values => {
        req.body.id = req.params.id
        return FulfillmentService.destroy(req.body)
      })
      .then(fulfillment => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, fulfillment)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

