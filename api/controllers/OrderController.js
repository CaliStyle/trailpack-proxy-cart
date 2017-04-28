/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')

/**
 * @module OrderController
 * @description Order Controller.
 */
// TODO lock down certain requests by Owner(s)
module.exports = class OrderController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  /**
   * count the amount of orders
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
  findById(req, res){
    const orm = this.app.orm
    const Order = orm['Order']
    Order.findByIdDefault(req.params.id, {})
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error(`Order id ${ req.params.id } not found`))
        }
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
  findAll(req, res){
    const orm = this.app.orm
    const Order = orm['Order']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Order.findAndCount({
      order: sort,
      where: where,
      offset: offset,
      limit: limit
    })
      .then(orders => {
        res.set('X-Pagination-Total', orders.count)
        res.set('X-Pagination-Pages', Math.ceil(orders.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Offset', offset)
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(orders.rows)
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
    const CartService = this.app.services.CartService
    const SubscriptionService = this.app.services.SubscriptionService

    lib.Validator.validateOrder.create(req.body)
      .then(values => {
        if (req.body.cart || req.body.cart_token) {
          if (!req.body.cart) {
            req.body.cart = {}
          }
          if (req.body.cart_token) {
            req.body.cart.token = req.body.cart_token
          }
          // console.log('cart checkout order.create', req.body.cart)
          return CartService.prepareForOrder(req)
        }
        else if (req.body.subscription || req.body.subscription_token) {
          if (!req.body.subscription) {
            req.body.subscription = {}
          }
          if (req.body.subscription_token) {
            req.body.subscription.token = req.body.subscription_token
          }
          return SubscriptionService.prepareForOrder(req.body.subscription)
        }
        else {
          throw new Error('Requires a Cart or Subscription to create Order')
        }
      })
      .then(preparedOrder => {
        if (!preparedOrder) {
          throw new Error('Not Ready For Order')
        }
        // console.log('cart checkout order.create', preparedOrder)
        return OrderService.create(preparedOrder)
      })
      .then(data => {
        // console.log('CartController.checkout Order', data)
        if (!data) {
          throw new Error('Unexpected Error while creating order')
        }
        return res.json(data)
      })
      .catch(err => {
        // console.log('cart checkout order.create', err)
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

  addTag(req, res) {
    //
  }
  removeTag(req, res) {
    //
  }
}

