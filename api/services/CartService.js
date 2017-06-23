/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const shortid = require('shortid')
const Errors = require('proxy-engine-errors')
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD
const CART_STATUS = require('../utils/enums').CART_STATUS

/**
 * @module CartService
 * @description Cart Service
 */
module.exports = class CartService extends Service {

  /**
   *
   * @param cart
   * @param options
   */
  create(cart, options){
    const Cart = this.app.orm.Cart
    if (!options) {
      options = {}
    }
    // If line items is empty
    if (!cart.line_items) {
      cart.line_items = []
    }

    // Remove the items from the cart creation so we can resolve them
    const items = cart.line_items
    delete cart.line_items

    const resCart = Cart.build(cart, {
      include: [
        {
          model: this.app.orm['Address'],
          as: 'shipping_address'
        },
        {
          model: this.app.orm['Address'],
          as: 'billing_address'
        }
      ]
    })

    return Promise.all(items.map(item => {
      return this.app.services.ProductService.resolveItem(item, {transaction: options.transaction || null})
    }))
      .then(resolvedItems => {
        return Promise.all(resolvedItems.map((item, index) => {
          return resCart.addLine(item, items[index].quantity, items[index].properties)
        }))
      })
      .then(resolvedItems => {
        // console.log('RESOLVED ITEMS', resolvedItems)
        // console.log('THIS CREATED CART', cart)
        return resCart.save({transaction: options.transaction || null})
      })
      .then(() => {
        if (cart.shipping_address) {
          if (cart.shipping_address.id) {
            return resCart.setShipping_address(cart.shipping_address.id, {transaction: options.transaction || null})
          }
          else {
            resCart.shipping_address = _.extend(resCart.shipping_address, cart.shipping_address)
            return resCart.shipping_address.save({transaction: options.transaction || null})
          }
        }
        return
      })
      .then(shippingAddress => {
        if (cart.billing_address) {
          if (cart.billing_address.id) {
            return resCart.setBilling_address(cart.billing_address.id, {transaction: options.transaction || null})
          }
          else {
            resCart.billing_address = _.extend(resCart.billing_address, cart.billing_address)
            return resCart.billing_address.save({transaction: options.transaction || null})
          }
        }
        return
      })
      .then(billingAddress => {
        return resCart
      })
  }

  /**
   *
   * @param cart
   * @returns {Promise<T>|Cart}
   */
  update(cart, options){
    options = options || {}
    const Cart = this.app.orm['Cart']
    if (!cart.id) {
      const err = new Errors.FoundError(Error('Cart is missing id'))
      return Promise.reject(err)
    }
    let resCart
    // Only allow a few values for update since this can be done from the client side
    const update = _.pick(cart, ['customer_id', 'host', 'ip', 'update_ip', 'client_details'])
    return Cart.resolve(cart.id, {transaction: options.transaction || null})
      .then(foundCart => {
        resCart = _.extend(foundCart, update)
        return resCart.save({transaction: options.transaction || null})
      })
      .then(() => {
        if (cart.shipping_address) {
          if (cart.shipping_address.id) {
            return resCart.setShipping_address(cart.shipping_address.id, {transaction: options.transaction || null})
          }
          else {
            resCart.shipping_address = _.extend(resCart.shipping_address, cart.shipping_address)
            return resCart.shipping_address.save({transaction: options.transaction || null})
          }
        }
        return
      })
      .then(shippingAddress => {
        if (cart.billing_address) {
          if (cart.billing_address.id) {
            return resCart.setBilling_address(cart.billing_address.id, {transaction: options.transaction || null})
          }
          else {
            resCart.billing_address = _.extend(resCart.billing_address, cart.billing_address)
            return resCart.billing_address.save({transaction: options.transaction || null})
          }
        }
        return
      })
      .then(billingAddress => {
        return resCart
      })
  }

  /**
   *
   * @param req
   * @returns {Promise.<*>}
   */
  checkout(req){
    // const Cart = this.app.orm['Cart']

    if (!req.body.cart) {
      const err = new Errors.FoundError(Error('Cart is missing in request'))
      return Promise.reject(err)
    }

    let resOrder
    return this.prepareForOrder(req)
      .then(newOrder => {
        return this.app.services.OrderService.create(newOrder)
      })
      .then(order => {
        if (!order) {
          throw new Error('Unexpected error during checkout')
        }

        if (order.customer_id) {
          // Track Event
          const event = {
            object_id: order.customer_id,
            object: 'customer',
            objects: [{
              customer: order.customer_id
            },{
              order: order.id
            }],
            type: 'customer.cart.checkout',
            message: `Customer Cart ${ order.cart_token } checked out and created Order ${order.name}`,
            data: order
          }
          this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
        }

        resOrder = order

        // Close the Cart
        return this.afterOrder(req, resOrder)
      })
      .then(cart => {
        // Switch to a new cart
        return this.createAndSwitch(req)
      })
      .then(newCart => {
        return {
          cart: newCart,
          order: resOrder
        }
      })
  }

  /**
   *
   * @param req
   * @returns {Promise.<TResult>}
   */
  prepareForOrder(req) {
    const AccountService = this.app.services.AccountService
    const Cart = this.app.orm['Cart']
    let resCart, resCustomer, customerID, userID

    // Establish who placed the order
    if (req.user && req.user.id) {
      userID = req.user.id
    }

    return Cart.resolve(req.body.cart)
      .then(cart => {
        if (!cart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }

        if (cart.status !== CART_STATUS.OPEN) {
          // TODO CREATE PROPER ERROR
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = cart
        resCart.close(CART_STATUS.CLOSED)
        return resCart.recalculate()
        // return resCart.save()
      })
      .then(cart => {
        if (req.body.customer && req.body.customer.id) {
          customerID = req.body.customer.id
        }
        else if (req.body.customer_id) {
          customerID = req.body.customer_id
        }
        else {
          customerID = resCart.customer_id
        }

        if (customerID) {
          return this.app.orm['Customer'].findById(customerID, {
            attributes: ['id', 'email']
          })
        }
        return
      })
      .then(customer => {
        resCustomer = customer
        if (resCustomer && (req.body.payment_details && req.body.payment_details.length > 0)) {
          return AccountService.resolvePaymentDetailsToSources(resCustomer, req.body.payment_details)
            .then(paymentDetails => {
              return paymentDetails
            })
        }
        else if (resCustomer && (req.body.payment_details && req.body.payment_details.length == 0)) {
          return AccountService.getDefaultSource(resCustomer)
            .then(source => {
              if (!source) {
                return []
              }
              return  [{
                gateway: source.gateway,
                source: source,
              }]
            })
        }
        else {
          resCustomer = {}
          return req.body.payment_details
        }
      })
      .then(paymentDetails => {

        const newOrder = resCart.buildOrder({
          // Request info
          client_details: req.body.client_details,
          ip: req.body.ip,
          payment_details: paymentDetails,
          payment_kind: req.body.payment_kind,
          fulfillment_kind: req.body.fulfillment_kind,
          processing_method: PAYMENT_PROCESSING_METHOD.CHECKOUT,
          shipping_address: req.body.shipping_address,
          billing_address: req.body.billing_address,
          // Customer Info
          customer_id: customerID,
          email: req.body['email'] || resCustomer['email'] || null,
          // User ID
          user_id: userID || null,
        })
        return newOrder
      })
  }

  /**
   *
   * @param req
   * @param order
   * @returns {Promise}
   */
  afterOrder(req, order){
    const Cart = this.app.orm['Cart']
    return Cart.resolve(req.body.cart)
      .then(cart => {
        cart.order(order)
        return cart.save()
      })
  }

  /**
   *
   * @param overrides
   * @param id
   * @returns {Promise}
   */
  pricingOverrides(overrides, id, admin){
    const Cart = this.app.orm['Cart']
    if (_.isObject(overrides) && overrides.pricing_overrides){
      overrides = overrides.pricing_overrides
    }
    overrides = overrides.map(override => {
      override.admin_id = override.admin_id ? override.admin_id : admin.id
      return override
    })
    // console.log(overrides, id, admin)
    return Cart.resolve(id)
      .then(cart => {
        cart.pricing_overrides = overrides
        cart.pricing_override_id = admin.id
        return cart.save()
      })
  }
  /**
   *
   * @param cart
   * @returns {Cart} // An instance of the Cart
   */
  addDiscountToCart(data){
    return Promise.resolve(data)
  }
  removeDiscountFromCart(data){
    return Promise.resolve(data)
  }
  addCouponToCart(data){
    return Promise.resolve(data)
  }
  removeCouponFromCart(data){
    return Promise.resolve(data)
  }
  addGiftCardToCart(data){
    return Promise.resolve(data)
  }
  removeGiftCardFromCart(data){
    return Promise.resolve(data)
  }

  /**
   *
   * @param items
   * @param cart
   * @returns {Promise}
   */
  addItemsToCart(items, cart){
    const Cart = this.app.orm['Cart']
    if (items.line_items) {
      items = items.line_items
    }
    let resCart
    return Cart.resolve(cart)
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }
        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = foundCart
        // const minimize = _.unionBy(items, 'product_id')
        return Promise.all(items.map(item => {
          return this.app.services.ProductService.resolveItem(item)
        }))
      })
      .then(resolvedItems => {
        return Promise.all(resolvedItems.map((item, index) => {
          return resCart.addLine(item, items[index].quantity, items[index].properties)
        }))
      })
      .then(resolvedItems => {
        // console.log('CartService.addItemsToCart', cart)
        return resCart.save()
      })
  }

  /**
   *
   * @param items
   * @param cart
   * @returns {Promise}
   */
  removeItemsFromCart(items, cart){
    const Cart = this.app.orm['Cart']
    if (items.line_items) {
      items = items.line_items
    }
    let resCart
    return Cart.resolve(cart)
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }
        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = foundCart
        return Promise.all(items.map(item => {
          return this.app.services.ProductService.resolveItem(item)
        }))
      })
      .then(resolvedItems => {
        return Promise.all(resolvedItems.map((item, index) => {
          resCart.removeLine(item, items[index].quantity)
        }))
      })
      .then(resolvedItems => {
        return resCart.save()
      })
  }
  clearCart(cart, options){
    options = options || {}
    const Cart = this.app.orm['Cart']
    return Cart.resolve(cart, options)
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }
        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }
        cart = foundCart
        cart = _.extend(cart, { line_items: [] })
        return cart.save()
      })
  }

  /**
   *
   * @param req
   */
  createAndSwitch(req){
    const User = this.app.orm['User']
    const cart = {}
    const owners = []
    let customerId

    if (req.user) {
      owners.push(req.user)
      customerId = req.user.current_customer_id
      cart.customer_id = customerId
    }
    if (!customerId && req.customer) {
      cart.customer_id = req.customer.id
    }

    return this.create(cart)
      .then(cart => {
        if (req.user) {
          return User.findById(req.user.id)
            .then(user => {
              user.current_cart_id = cart.id
              return user.save()
            })
            .then(user => {
              return new Promise((resolve, reject) => {
                req.loginCart(cart, (err) => {
                  if (err) {
                    return reject(err)
                  }
                  return resolve(cart)
                })
              })
            })
        }
        else {
          return new Promise((resolve, reject) => {
            req.loginCart(cart, (err) => {
              if (err) {
                return reject(err)
              }
              return resolve(cart)
            })
          })
        }
      })

  }
  /**
   *
   * @param cart
   * @returns {Promise.<TResult>}
   */
  beforeCreate(cart) {
    if (cart.ip) {
      cart.create_ip = cart.ip
    }
    // If not token was already created, create it
    if (!cart.token) {
      cart.token = `cart_${shortid.generate()}`
    }

    return this.app.services.ShopService.resolve(cart.shop_id)
      .then(shop => {
        // console.log('CartService.beforeCreate', shop)
        cart.shop_id = shop.id
        return cart.recalculate()
      })
      .catch(err => {
        // console.log('CartService.beforeCreate', err)
        return cart.recalculate()
      })
  }

  /**
   *
   * @param cart
   * @returns {Promise.<T>}
   */
  beforeUpdate(cart){
    if (cart.ip) {
      cart.update_ip = cart.ip
    }
    if (cart.status == CART_STATUS.OPEN) {
      return cart.recalculate()
    }
    else {
      return Promise.resolve(cart)
    }
  }
  beforeSave(cart){
    if (cart.status == CART_STATUS.OPEN) {
      return cart.recalculate()
    }
    else {
      return Promise.resolve(cart)
    }
  }
}

