'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
// const Errors = require('proxy-engine-errors')

/**
 * @module OrderController
 * @description Order Controller.
 */
module.exports = class OrderController extends Controller {
  /**
   * count the amount of carts
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Order')
      .then(count => {
        const counts = {
          orders: count
        }
        return res.json(counts)
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
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.create(req.body)
      .then(values => {
        return OrderService.create(req.body)
      })
      .then(order => {
        return res.json(order)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  update(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.update(req.body)
      .then(values => {
        req.body.id = req.params.id
        return OrderService.update(req.body)
      })
      .then(order => {
        return res.json(order)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  cancel(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.cancel(req.body)
      .then(values => {
        req.body.id = req.params.id
        return OrderService.cancel(req.body)
      })
      .then(order => {
        return res.json(order)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  refund(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.refund(req.body)
      .then(values => {
        req.body.id = req.params.id
        return OrderService.refund(req.body)
      })
      .then(order => {
        return res.json(order)
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
  exportOrders(req, res) {
    //
  }
}

