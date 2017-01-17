'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
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

  /**
   *
   * @param obj
   * @returns {Promise}
   */
  // TODO handle taxes, shipping, subscriptions, start transactions/fulfillment
  // TODO handle inventory policy
  create(obj) {
    const Customer = this.app.services.ProxyEngineService.getModel('Customer')
    const Cart = this.app.services.ProxyEngineService.getModel('Cart')
    const Address = this.app.services.ProxyEngineService.getModel('Address')
    const Order = this.app.services.ProxyEngineService.getModel('Order')
    const OrderItem = this.app.services.ProxyEngineService.getModel('OrderItem')
    const PaymentService = this.app.services.PaymentService

    // Validate obj cart and customer
    if (!obj.cart_token) {
      const err = new Errors.FoundError(Error('Missing Cart token'))
      return Promise.reject(err)
    }
    if (!obj.customer_id) {
      const err = new Errors.FoundError(Error('Missing Customer id'))
      return Promise.reject(err)
    }

    let resOrder = {}
    let resCart = {}
    let resCustomer = {}
    let resBillingAddress = {}
    let resShippingAddress = {}

    return Cart.find({where: { token: obj.cart_token }})
      .then(cart => {
        if (!cart) {
          throw new Errors.FoundError(Error(`Could not find cart by token '${obj.cart_token}'`))
        }
        if (cart.status !== Cart.CART_STATUS.OPEN) {
          throw new Errors.ConflictError(Error(`Cart status '${cart.status}' is not '${Cart.CART_STATUS.OPEN}'`))
        }
        resCart = cart
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
      })
      .then(customer => {
        // TODO, make this not required for POS
        if (!customer) {
          throw new Errors.FoundError(Error(`Could not find customer by id '${obj.customer_id}'`))
        }
        if (!customer.billing_address) {
          throw new Errors.FoundError(Error(`Could not find customer billing address for id '${obj.customer_id}'`))
        }
        if (!customer.shipping_address) {
          throw new Errors.FoundError(Error(`Could not find customer shipping address for id '${obj.customer_id}'`))
        }
        resCustomer = customer
        resBillingAddress = customer.billing_address || obj.billing_address
        resShippingAddress = customer.shipping_address || obj.shipping_address

        const order = {
          // Order Info
          processing_method: obj.processing_method,

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
          billing_address: resBillingAddress || obj.billing_address,
          shipping_address: resShippingAddress || obj.shipping_address
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
        resCustomer.setLastOrder(resOrder)
        // TODO create a blank new cart for customer
        // resCustomer.newCart()
        return resCustomer.save()
      })
      .then(customer => {
        let orderPayment = obj.payment_kind || this.app.config.proxyCart.order_payment_kind
        if (!orderPayment) {
          this.app.log.debug('Order does not have a payment function, defaulting to manual')
          orderPayment = 'manual'
        }
        const transaction = {
          order_id: resOrder.id,
          currency: resOrder.currency,
          payment_details: obj.payment_details,
          device_id: obj.device_id,
          amount: resOrder.total_price
        }
        return PaymentService[orderPayment](transaction)
          .then(transaction => {
            // TODO resolve Mark as paid
            resOrder.setFinancialStatus([transaction])
            return resOrder.save()
          })
      })
      .then(order => {
        return Order.findIdDefault(resOrder.id)
      })
  }

  /**
   *
   * @param order
   * @returns {*|Promise.<TResult>}
   */
  payOrder(order, gateway) {
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
  refundOrder(order, refund) {
    return this.resolve(order)
      .then(order => {

        return order
      })
  }
}

