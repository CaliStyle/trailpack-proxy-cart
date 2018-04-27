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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  findByToken(req, res){
    const orm = this.app.orm
    const Order = orm['Order']
    Order.findByTokenDefault(req.params.token, {})
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error(`Order token ${ req.params.token } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  resolve(req, res){
    const orm = this.app.orm
    const Order = orm['Order']
    Order.resolve(req.params.id, {})
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error(`Order ${ req.params.id } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  findAll(req, res){
    const orm = this.app.orm
    const Order = orm['Order']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Order.findAndCountDefault({
      order: sort,
      where: where,
      offset: offset,
      limit: limit
    })
      .then(orders => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, orders.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orders.rows)
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
  search(req, res) {
    const orm = this.app.orm
    const Order = orm['Order']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const term = req.query.term
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)
    const defaults = _.defaults(where, {
      $or: [
        {
          number: {
            $iLike: `%${term}%`
          }
        },
        {
          name: {
            $iLike: `%${term}%`
          }
        },
        {
          email: {
            $iLike: `%${term}%`
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
        this.app.services.ProxyEngineService.paginate(res, orders.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orders.rows)
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
  customer(req, res){
    const orm = this.app.orm
    const Order = orm['Order']
    const Customer = orm['Customer']
    Order.findById(req.params.id, {
      attributes: ['id', 'customer_id']
    })
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error(`Order id ${ req.params.id } not found`))
        }
        if (!order.customer_id) {
          throw new Errors.FoundError(Error(`Order id ${ req.params.id } customer not found`))
        }
        return Customer.findById(order.customer_id)
      })
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error(`Order id ${ req.params.id } customer not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
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
      .then(order => {
        // console.log('CartController.checkout Order', data)
        if (!order) {
          throw new Error('Unexpected Error while creating order')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('cart checkout order.create', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  update(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.update(req.body)
      .then(values => {
        req.body.id = req.params.id
        return OrderService.update(req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  cancel(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.cancel(req.body)
      .then(values => {
        req.body.id = req.params.id
        return OrderService.cancel(req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  authorize(req, res) {
    const orderId = req.params.id
    if (!orderId) {
      const err = new Error('Order Id is required')
      return res.serverError(err)
    }
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.authorize(req.body)
      .then(values => {
        return OrderService.authorize(orderId, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  capture(req, res) {
    const orderId = req.params.id
    if (!orderId) {
      const err = new Error('Order Id is required')
      return res.serverError(err)
    }

    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.capture(req.body)
      .then(values => {
        return OrderService.capture(orderId, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  void(req, res) {
    const orderId = req.params.id
    if (!orderId) {
      const err = new Error('Order Id is required')
      return res.serverError(err)
    }

    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.void(req.body)
      .then(values => {
        return OrderService.void(orderId, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  retry(req, res) {
    const orderId = req.params.id
    if (!orderId) {
      const err = new Error('Order Id is required')
      return res.serverError(err)
    }

    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.retry(req.body)
      .then(values => {
        return OrderService.retry(orderId, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  refund(req, res) {
    const orderId = req.params.id
    if (!orderId) {
      const err = new Error('Order Id is required')
      return res.serverError(err)
    }

    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.refund(req.body)
      .then(values => {
        return OrderService.refund(orderId, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  refunds(req, res) {
    const Refund = this.app.orm['Refund']
    const orderId = req.params.id

    if (!orderId && !req.user) {
      const err = new Error('A order id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    Refund.findAndCount({
      order: sort,
      where: {
        order_id: orderId
      },
      offset: offset,
      limit: limit
    })
      .then(refunds => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, refunds.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, refunds.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Send Order Fulfillment
   * @param req
   * @param res
   */
  // TODO
  send(req, res) {
    const orderId = req.params.id

    if (!orderId) {
      const err = new Error('Order Id is required')
      return res.serverError(err)
    }

    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.send(req.body)
      .then(values => {
        return OrderService.send(orderId, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * upload CSV
   * @param req
   * @param res
   */
  uploadCSV(req, res) {
    const OrderCsvService = this.app.services.OrderCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    OrderCsvService.orderCsv(csv.path)
      .then(result => {
        return res.json({
          file: req.file,
          result: result
        })
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
  processUpload(req, res) {
    const OrderCsvService = this.app.services.OrderCsvService
    OrderCsvService.processOrderUpload(req.params.id)
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
  // TODO
  exportOrders(req, res) {
    //
  }

  /**
   *
   * @param req
   * @param res
   */
  addTag(req, res){
    const OrderService = this.app.services.OrderService
    OrderService.addTag(req.params.id, req.params.tag)
      .then(tag => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tag)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('OrderController.addTag', err)
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  removeTag(req, res){
    const OrderService = this.app.services.OrderService
    OrderService.removeTag(req.params.id, req.params.tag)
      .then(tag => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tag)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('OrderController.removeTag', err)
        return res.serverError(err)
      })
  }

  /**
   * ADMIN ONLY FEATURE
   * @param req
   * @param res
   */
  pricingOverrides(req, res) {
    const OrderService = this.app.services.OrderService
    let id = req.params.id

    if (!id && req.body.id) {
      id = req.body.id
    }

    if (!id && req.order) {
      id = req.order.id
    }

    lib.Validator.validateOrder.pricingOverrides(req.body)
      .then(values => {
        return OrderService.pricingOverrides(req.body, id, req.user)
      })
      .then(order => {
        if (!order) {
          throw new Error('Unexpected Error while overriding prices')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('ProductController.removeItemsFromOrder', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addItem(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.addItem(req.body)
      .then(values => {
        return OrderService.addItem(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  addItems(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.addItems(req.body)
      .then(values => {
        return OrderService.addItems(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  updateItem(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.updateItem(req.body)
      .then(values => {
        return OrderService.updateItem(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  removeItem(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.removeItem(req.body)
      .then(values => {
        return OrderService.removeItem(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  addShipping(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.addShipping(req.body)
      .then(values => {
        return OrderService.addShipping(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  removeShipping(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.removeShipping(req.body)
      .then(values => {
        return OrderService.removeShipping(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  addTaxes(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.addTaxes(req.body)
      .then(values => {
        return OrderService.addTaxes(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  removeTaxes(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.removeTaxes(req.body)
      .then(values => {
        return OrderService.removeTaxes(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  pay(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.pay(req.body)
      .then(values => {
        return OrderService.pay(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  authorizeTransaction(req, res) {
    const id = req.params.id
    const transaction = req.params.transaction
    const OrderService = this.app.services.OrderService
    lib.Validator.validateTransaction.authorize(req.body)
      .then(values => {
        return OrderService.authorizeTransaction(id, transaction)
      })
      .then(orderAndTransactions => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orderAndTransactions)
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
  captureTransaction(req, res) {
    const id = req.params.id
    const transaction = req.params.transaction
    const OrderService = this.app.services.OrderService
    lib.Validator.validateTransaction.capture(req.body)
      .then(values => {
        return OrderService.captureTransaction(id, transaction)
      })
      .then(orderAndTransactions => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orderAndTransactions)
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
  payTransaction(req, res) {
    const id = req.params.id
    const transaction = req.params.transaction
    const OrderService = this.app.services.OrderService
    lib.Validator.validateTransaction.sale(req.body)
      .then(values => {
        return OrderService.payTransaction(id, transaction)
      })
      .then(orderAndTransactions => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orderAndTransactions)
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
  voidTransaction(req, res) {
    const id = req.params.id
    const transaction = req.params.transaction
    const OrderService = this.app.services.OrderService
    lib.Validator.validateTransaction.void(req.body)
      .then(values => {
        return OrderService.voidTransaction(id, transaction)
      })
      .then(orderAndTransactions => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orderAndTransactions)
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
  refundTransaction(req, res) {
    const id = req.params.id
    const transaction = req.params.transaction
    const OrderService = this.app.services.OrderService
    lib.Validator.validateTransaction.refund(req.body)
      .then(values => {
        return OrderService.refundTransaction(id, transaction)
      })
      .then(orderAndTransactions => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orderAndTransactions)
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
  retryTransaction(req, res) {
    const id = req.params.id
    const transaction = req.params.transaction
    const OrderService = this.app.services.OrderService
    lib.Validator.validateTransaction.retry(req.body)
      .then(values => {
        return OrderService.retryTransaction(id, transaction)
      })
      .then(orderAndTransactions => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orderAndTransactions)
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
  cancelTransaction(req, res) {
    const id = req.params.id
    const transaction = req.params.transaction
    const OrderService = this.app.services.OrderService
    lib.Validator.validateTransaction.cancel(req.body)
      .then(values => {
        return OrderService.cancelTransaction(id, transaction)
      })
      .then(orderAndTransactions => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orderAndTransactions)
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
  fulfill(req, res) {
    const OrderService = this.app.services.OrderService
    lib.Validator.validateOrder.fulfill(req.body)
      .then(values => {
        return OrderService.fulfill(req.params.id, req.body)
      })
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
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
  updateFulfillment(req, res) {
    const OrderService = this.app.services.OrderService

    OrderService.updateFulfillment(req.params.id, req.params.fulfillment)
      .then(orderAndFulfillments => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orderAndFulfillments)
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
  event(req, res) {
    const Event = this.app.orm['Event']
    const eventId = req.params.event

    if (!eventId || !req.user) {
      const err = new Error('A order id and a user in session are required')
      res.send(401, err)

    }
    Event.findById(eventId)
      .then(event => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, event)
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
  events(req, res) {
    const Event = this.app.orm['Event']
    const orderId = req.params.id

    if (!orderId && !req.user) {
      const err = new Error('A order id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

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
        this.app.services.ProxyEngineService.paginate(res, events.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, events.rows)
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
  transactions(req, res) {
    const Transaction = this.app.orm['Transaction']
    const orderId = req.params.id

    if (!orderId && !req.user) {
      const err = new Error('A order id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

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
        this.app.services.ProxyEngineService.paginate(res, transactions.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transactions.rows)
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
  fulfillments(req, res) {
    const Fulfillment = this.app.orm['Fulfillment']
    const orderId = req.params.id

    if (!orderId && !req.user) {
      const err = new Error('A order id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

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
}

