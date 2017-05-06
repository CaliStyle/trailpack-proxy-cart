/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')

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

    Order.findAndCountDefault({
      order: sort,
      where: where,
      offset: offset,
      limit: limit
    })
      .then(orders => {
        // Paginate
        this.app.services.ProxyCartService.paginate(res, orders.count, limit, offset, sort)
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
  search(req, res) {
    const orm = this.app.orm
    const Order = orm['Order']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const term = req.query.term
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)
    const defaults = _.defaults(where, {
      $or: [
        {
          number: {
            $like: `%${term}%`
          }
        },
        {
          name: {
            $like: `%${term}%`
          }
        },
        {
          email: {
            $like: `%${term}%`
          }
        }
      ]
    })
    console.log('OrderController.search', term)
    Order.findAndCountDefault({
      where: defaults,
      order: sort,
      offset: offset,
      req: req,
      limit: limit
    })
      .then(orders => {
        // Paginate
        this.app.services.ProxyCartService.paginate(res, orders.count, limit, offset, sort)
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

  /**
   *
   * @param req
   * @param res
   */
  event(req, res) {
    const Event = this.app.orm['Event']
    const eventId = req.params.event

    if (!eventId || !req.user) {
      const err = new Error('A order id and a user in session are required')
      res.send(401, err)

    }
    Event.findById(eventId)
      .then(event => {
        return res.json(event)
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
  events(req, res) {
    const Event = this.app.orm['Event']
    const orderId = req.params.id

    if (!orderId && !req.user) {
      const err = new Error('A order id and a user in session are required')
      return res.send(401, err)
    }

    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'

    Event.findAndCount({
      order: sort,
      where: {
        object_id: orderId,
        object: 'order'
      },
      offset: offset,
      limit: limit
    })
      .then(events => {
        // Paginate
        this.app.services.ProxyCartService.paginate(res, events.count, limit, offset, sort)
        return res.json(events.rows)
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
  transactions(req, res) {
    const Transaction = this.app.orm['Transaction']
    const orderId = req.params.id

    if (!orderId && !req.user) {
      const err = new Error('A order id and a user in session are required')
      return res.send(401, err)
    }

    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'

    Transaction.findAndCount({
      order: sort,
      where: {
        order_id: orderId
      },
      offset: offset,
      limit: limit
    })
      .then(transactions => {
        // Paginate
        this.app.services.ProxyCartService.paginate(res, transactions.count, limit, offset, sort)
        return res.json(transactions.rows)
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
  fulfillments(req, res) {
    const Fulfillment = this.app.orm['Fulfillment']
    const orderId = req.params.id

    if (!orderId && !req.user) {
      const err = new Error('A order id and a user in session are required')
      return res.send(401, err)
    }

    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'

    Fulfillment.findAndCount({
      order: sort,
      where: {
        order_id: orderId
      },
      offset: offset,
      limit: limit
    })
      .then(fulfillments => {
        // Paginate
        this.app.services.ProxyCartService.paginate(res, fulfillments.count, limit, offset, sort)
        return res.json(fulfillments.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

