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
  resolve(cart, options){
    // console.log('TYPEOF cart',typeof cart)
    const Cart =  this.app.orm.Cart
    if (cart instanceof Cart.Instance){
      return Promise.resolve(cart)
    }
    else if (cart && _.isObject(cart) && cart.id) {
      return Cart.findById(cart.id, options)
        .then(resCart => {
          if (!resCart) {
            throw new Errors.FoundError(Error(`Cart ${cart.id} not found`))
          }
          return resCart
        })
    }
    else if (cart && _.isObject(cart) && cart.token) {
      return Cart.findOne({
        where: { token: cart.token }
      }, options)
        .then(resCart => {
          if (!resCart) {
            throw new Errors.FoundError(Error(`Cart ${cart.token} not found`))
          }
          return resCart
        })
    }
    else if (cart && _.isObject(cart)) {
      return this.create(cart, options)
    }
    else if (cart && (_.isString(cart) || _.isNumber(cart))) {
      return Cart.findById(cart, options)
        .then(resCart => {
          if (!resCart) {
            throw new Errors.FoundError(Error(`Cart ${cart} not found`))
          }
          return resCart
        })
    }
    else {
      // TODO create proper error
      const err = new Error(`Unable to resolve Cart ${cart}`)
      return Promise.reject(err)
    }
  }

  /**
   *
   * @param data
   * @returns {Cart}
   */
  create(data, options){
    const Cart = this.app.orm.Cart

    // If line items is empty
    if (!data.line_items) {
      data.line_items = []
    }

    // Remove the items from the cart creation so we can resolve them
    const items = data.line_items
    delete data.line_items

    const cart = Cart.build(data)

    return Promise.all(items.map(item => {
      return this.app.services.ProductService.resolveItem(item)
    }))
      .then(resolvedItems => {
        return Promise.all(resolvedItems.map((item, index) => {
          return cart.addLine(item, items[index].quantity, items[index].properties)
        }))
      })
      .then(resolvedItems => {
        // console.log('RESOLVED ITEMS', resolvedItems)
        // console.log('THIS CREATED CART', cart)
        return cart.save()
      })
  }

  /**
   *
   * @param cart
   * @returns {Promise<T>|Cart}
   */
  update(cart, options){
    if (!cart.id) {
      const err = new Errors.FoundError(Error('Cart is missing id'))
      return Promise.reject(err)
    }

    const update = _.omit(cart,['id','created_at','updated_at'])
    return this.resolve(cart)
      .then(cart => {
        cart = _.extend(cart, update)
        return cart.save()
      })
  }

  /**
   *
   * @param data
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
            type: 'customer.cart.checkout',
            message: 'Customer cart checked out',
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

  prepareForOrder(req) {
    const AccountService = this.app.services.AccountService
    let resCart, resCustomer, customerID, userID

    // Establish who placed the order
    if (req.user && req.user.id) {
      userID = req.user.id
    }

    return this.resolve(req.body.cart)
      .then(cart => {
        if (!cart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }

        if (cart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = cart
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
        // console.log('cart checkout paymentDetails', paymentDetails)
        const newOrder = {
          // Request info
          client_details: req.body.client_details,
          ip: req.body.ip,
          payment_details: paymentDetails,
          payment_kind: req.body.payment_kind || this.app.config.proxyCart.order_payment_kind,
          fulfillment_kind: req.body.fulfillment_kind || this.app.config.proxyCart.order_fulfillment_kind,
          processing_method: PAYMENT_PROCESSING_METHOD.CHECKOUT,
          shipping_address: req.body.shipping_address,
          billing_address: req.body.billing_address,

          // Customer Info
          customer_id: customerID,
          email: req.body['email'] || resCustomer['email'] || null,

          // User ID
          user_id: userID || null,

          // Cart Info
          cart_token: resCart.token,
          currency: resCart.currency,
          line_items: resCart.line_items,
          tax_lines: resCart.tax_lines,
          shipping_lines: resCart.shipping_lines,
          discounted_lines: resCart.discounted_lines,
          coupon_lines: resCart.coupon_lines,
          subtotal_price: resCart.subtotal_price,
          taxes_included: resCart.taxes_included,
          total_discounts: resCart.total_discounts,
          total_line_items_price: resCart.total_line_items_price,
          total_price: resCart.total_due,
          total_due: resCart.total_due,
          total_tax: resCart.total_tax,
          total_weight: resCart.total_weight,
          total_items: resCart.total_items,
          shop_id: resCart.shop_id,
          has_shipping: resCart.has_shipping,
          has_subscription: resCart.has_subscription,

          //Pricing Overrides
          pricing_override_id: resCart.pricing_override_id,
          pricing_overrides: resCart.pricing_overrides,
          total_overrides: resCart.total_overrides
        }
        // console.log('cart checkout prepare', newOrder)
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
    return this.resolve(req.body.cart)
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

    if (_.isObject(overrides) && overrides.pricing_overrides){
      overrides = overrides.pricing_overrides
    }
    overrides = overrides.map(override => {
      override.admin_id = override.admin_id ? override.admin_id : admin.id
      return override
    })
    // console.log(overrides, id, admin)
    return this.resolve(id)
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
    if (items.line_items) {
      items = items.line_items
    }
    let resCart
    return this.resolve(cart)
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
    if (items.line_items) {
      items = items.line_items
    }
    let resCart
    return this.resolve(cart)
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
  clearCart(cart){
    return new Promise((resolve, reject) => {
      this.resolve(cart)
        .then(foundCart => {
          if (!foundCart) {
            const err = new Errors.FoundError(Error('Cart Not Found'))
            return reject(err)
          }
          if (foundCart.status !== CART_STATUS.OPEN) {
            const err = new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
            return reject(err)
          }
          cart = foundCart
          cart = _.extend(cart, { line_items: [] })
          return cart.save()
        })
        .then(cart => {
          return resolve(cart)
        })
        .catch(err => {
          return reject(err)
        })
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
}

