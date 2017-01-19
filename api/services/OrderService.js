/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
const ORDER_FULFILLMENT_KIND = require('../utils/enums').ORDER_FULFILLMENT_KIND
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const TRANSACTION_KIND = require('../utils/enums').TRANSACTION_KIND
/**
 * @module OrderService
 * @description Order Service
 */
module.exports = class OrderService extends Service {
  /**
   *
   * @param order
   * @param options
   * @returns {Promise}
   */
  resolve(order, options) {
    const Order =  this.app.services.ProxyEngineService.getModel('Order')
    if (order instanceof Order.Instance){
      return Promise.resolve(order)
    }
    else if (order && _.isObject(order) && order.id) {
      return Order.findById(order.id, options)
        .then(resOrder => {
          if (!resOrder) {
            throw new Errors.FoundError(Error(`Order ${order.id} not found`))
          }
          return resOrder
        })
    }
    else if (order && (_.isString(order) || _.isNumber(order))) {
      return Order.findById(order, options)
        .then(resOrder => {
          if (!resOrder) {
            throw new Errors.FoundError(Error(`Order ${order} not found`))
          }
          return resOrder
        })
    }
    else {
      const err = new Error('Unable to resolve Order')
      Promise.reject(err)
    }
  }

  resolveItem(item, options) {
    const OrderItem =  this.app.services.ProxyEngineService.getModel('OrderItem')
    if (item instanceof OrderItem.Instance){
      return Promise.resolve(item)
    }
    else if (item && _.isObject(item) && item.id) {
      return OrderItem.findById(item.id, options)
        .then(resOrderItem => {
          if (!resOrderItem) {
            throw new Errors.FoundError(Error(`Order ${item.id} not found`))
          }
          return resOrderItem
        })
    }
    else if (item && (_.isString(item) || _.isNumber(item))) {
      return OrderItem.findById(item, options)
        .then(resOrderItem => {
          if (!resOrderItem) {
            throw new Errors.FoundError(Error(`Order ${item} not found`))
          }
          return resOrderItem
        })
    }
    else {
      const err = new Error('Unable to resolve Order Item')
      Promise.reject(err)
    }
  }

  /**
   *
   * @param obj
   * @returns {Promise}
   */
  // TODO handle taxes, shipping, subscriptions, start transactions/fulfillment
  // TODO handle inventory policy
  create(obj) {
    const Address = this.app.services.ProxyEngineService.getModel('Address')
    const Customer = this.app.services.ProxyEngineService.getModel('Customer')
    const Cart = this.app.services.ProxyEngineService.getModel('Cart')
    const Order = this.app.services.ProxyEngineService.getModel('Order')
    const OrderItem = this.app.services.ProxyEngineService.getModel('OrderItem')
    const PaymentService = this.app.services.PaymentService

    // Validate obj cart and customer
    if (!obj.cart_token) {
      const err = new Errors.FoundError(Error('Missing Cart token'))
      return Promise.reject(err)
    }
    if (!obj.payment_details) {
      const err = new Errors.FoundError(Error('Missing Payment Details'))
      return Promise.reject(err)
    }

    let resOrder = {}
    let resCart = {}
    let resCustomer = {}
    let resBillingAddress = {}
    let resShippingAddress = {}

    return Order.sequelize.transaction(t => {
      return Cart.find({where: {token: obj.cart_token}})
        .then(cart => {
          if (!cart) {
            throw new Errors.FoundError(Error(`Could not find cart by token '${obj.cart_token}'`))
          }
          if (cart.status !== Cart.CART_STATUS.OPEN) {
            throw new Errors.ConflictError(Error(`Cart status '${cart.status}' is not '${Cart.CART_STATUS.OPEN}'`))
          }
          resCart = cart
          // If a customer is attached to this order
          if (obj.customer_id) {
            return Customer.findById(obj.customer_id, {
              include: [
                {
                  model: Address,
                  as: 'shipping_address'
                },
                {
                  model: Address,
                  as: 'billing_address'
                }
              ]
            })
          }
          else {
            return null
          }
        })
        .then(customer => {
          if (customer && !customer.billing_address && !obj.billing_address) {
            throw new Errors.FoundError(Error(`Could not find customer billing address for id '${obj.customer_id}'`))
          }
          if (customer && !customer.shipping_address && !obj.shipping_address) {
            throw new Errors.FoundError(Error(`Could not find customer shipping address for id '${obj.customer_id}'`))
          }
          if (!customer) {
            resCustomer = {
              id: null,
              billing_address: null,
              shipping_address: null
            }
          }
          else {
            resCustomer = customer
          }
          resBillingAddress = resCustomer.billing_address ? resCustomer.billing_address.get({plain: true}) : obj.billing_address
          resShippingAddress = resCustomer.shipping_address ? resCustomer.shipping_address.get({plain: true}) : obj.shipping_address
          // If Addresses, validate them
          if (resBillingAddress) {
            resBillingAddress = this.app.services.ProxyCartService.validateAddress(resBillingAddress)
          }
          if (resShippingAddress) {
            resShippingAddress = this.app.services.ProxyCartService.validateAddress(resShippingAddress)
          }

          const order = {
            // Order Info
            processing_method: obj.processing_method || PAYMENT_PROCESSING_METHOD.DIRECT,

            // Cart Info
            cart_token: resCart.token,
            currency: resCart.currency,
            order_items: resCart.line_items,
            tax_lines: resCart.tax_lines,
            shipping_lines: resCart.shipping_lines,
            subtotal_price: resCart.subtotal_price,
            taxes_included: resCart.taxes_included,
            total_discounts: resCart.total_discounts,
            total_line_items_price: resCart.total_line_items_price,
            total_price: resCart.total_price,
            total_tax: resCart.total_tax,
            total_weight: resCart.total_weight,

            // Client Info
            client_details: obj.client_details,
            ip: obj.ip,

            // Customer Info
            customer_id: resCustomer.id, // (May Be Null)
            buyer_accepts_marketing: resCustomer.accepts_marketing || obj.buyer_accepts_marketing,
            email: resCustomer.email || obj.email,
            billing_address: resBillingAddress,
            shipping_address: resShippingAddress
          }

          return Order.create(order, {
            include: [
              {
                model: OrderItem,
                as: 'order_items'
              }
            ]
          })
        })
        .then(order => {
          resOrder = order
          // Close the Cart
          resCart.close(Cart.CART_STATUS.ORDERED)
          return resCart.save()
        })
        .then(cart => {
          if (resCustomer instanceof Customer.Instance) {
            resCustomer.setLastOrder(resOrder)
            // TODO create a blank new cart for customer
            // resCustomer.newCart()
            return resCustomer.save()
          }
          else {
            return null
          }
        })
        .then(customer => {
          // Set proxy cart default payment kind if not set by order.create
          let orderPayment = obj.payment_kind || this.app.config.proxyCart.order_payment_kind
          if (!orderPayment) {
            this.app.log.debug(`Order does not have a payment function, defaulting to ${TRANSACTION_KIND.MANUAL}`)
            orderPayment = TRANSACTION_KIND.MANUAL
          }
          const transaction = {
            order_id: resOrder.id,
            currency: resOrder.currency,
            amount: resOrder.total_price,
            payment_details: obj.payment_details,
            device_id: obj.device_id || null
          }
          return PaymentService[orderPayment](transaction)
        })
        .then(transaction => {
          let orderFulfillment = obj.fulfillment_kind || this.app.config.proxyCart.order_fulfillment_kind
          if (!orderFulfillment) {
            this.app.log.debug(`Order does not have a fulfillment function, defaulting to ${ORDER_FULFILLMENT_KIND.MANUAL}`)
            orderFulfillment = ORDER_FULFILLMENT_KIND.MANUAL
          }
          if (transaction.status == TRANSACTION_STATUS.SUCCESS && transaction.kind == TRANSACTION_KIND.SALE && orderFulfillment == ORDER_FULFILLMENT_KIND.IMMEDIATE) {
            return this.app.services.FulfillmentService.fulfillOrder(resOrder)
          }
          else {
            return
          }
        })
        .then(fulfillments => {
          return Order.findIdDefault(resOrder.id)
        })
    })
  }

  /**
   *
   * @param order
   * @returns {Promise.<T>}
   */
  // TODO
  update(order) {
    const Order = this.app.services.ProxyEngineService.getModel('Order')

    return this.resolve(order)
      .then(resOrder => {
        if (resOrder.fulfillment_status !== FULFILLMENT_STATUS.NONE || resOrder.cancelled_at) {
          throw new Error(`${order.name} can not be updated as it is already being fulfilled`)
        }
        if (order.billing_address) {
          resOrder.billing_address = _.merge(resOrder.billing_address, order.billing_address)
          resOrder.billing_address = this.app.services.ProxyCartService.validateAddress(resOrder.billing_address)
        }
        if (order.shipping_address) {
          resOrder.shipping_address = _.merge(resOrder.shipping_address, order.shipping_address)
          resOrder.shipping_address = this.app.services.ProxyCartService.validateAddress(resOrder.shipping_address)
        }
        if (order.buyer_accepts_marketing) {
          resOrder.buyer_accepts_marketing = order.buyer_accepts_marketing
        }

        return resOrder.save()
      })
      .then(resOrder => {
        return Order.findIdDefault(resOrder.id)
      })
  }
  // TODO
  removeItem(data) {
    return Promise.resolve(data)
  }
  /**
   *
   * @param order
   * @returns {*|Promise.<TResult>}
   */
  // TODO
  pay(order, gateway) {
    return this.resolve(order)
      .then(order => {
        if (order.financial_status !== ('authorized' || 'partially_paid')) {
          throw new Error(`Order status is ${order.financial_status} not 'authorized or partially_paid'`)
        }
        return order
      })
  }
  /**
   *
   * @param order
   * @returns {*|Promise.<TResult>}
   */
  // TODO
  refund(order, refund) {
    return this.resolve(order)
      .then(order => {

        return order
      })
  }

  cancel(order) {
    return this.resolve(order)
      .then(order => {

        return order
      })
  }
}

