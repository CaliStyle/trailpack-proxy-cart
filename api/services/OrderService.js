'use strict'

const Service = require('trails/service')
// const _ = require('lodash')
const Errors = require('proxy-engine-errors')
/**
 * @module OrderService
 * @description Order Service
 */
module.exports = class OrderService extends Service {
  resolve() {

  }

  /**
   *
   * @param obj
   * @returns {Promise}
   */
  // TODO handle taxes, shipping, subscriptions, start transactions/fulfillment
  create(obj) {
    const Customer = this.app.services.ProxyEngineService.getModel('Customer')
    const Cart = this.app.services.ProxyEngineService.getModel('Cart')
    const Address = this.app.services.ProxyEngineService.getModel('Address')
    const Order = this.app.services.ProxyEngineService.getModel('Order')
    const OrderItem = this.app.services.ProxyEngineService.getModel('OrderItem')

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

    return Cart.findById(obj.cart_token)
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
        resBillingAddress = customer.billing_address
        resShippingAddress = customer.shipping_address

        const order = {
          // Customer Info
          customer_id: resCustomer.id,
          buyer_accepts_marketing: resCustomer.accepts_marketing,
          billing_address: resBillingAddress,
          shipping_address: resShippingAddress,
          // Cart Info
          cart_token: resCart.id,
          currency: resCart.currency,
          order_items: resCart.line_items
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
        return resCustomer.save()
      })
      .then(customer => {
        return resOrder.reload()
      })
  }
}

