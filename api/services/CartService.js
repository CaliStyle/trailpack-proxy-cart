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
    options = options || {}

    const Cart = this.app.orm['Cart']

    // If line items is empty
    if (!cart.line_items) {
      cart.line_items = []
    }

    // Remove the items from the cart creation so we can resolve them
    const items = cart.line_items
    delete cart.line_items

    // Resolve given addresses
    if (cart.shipping_address && !cart.billing_address) {
      cart.billing_address = cart.shipping_address
    }
    if (cart.billing_address && !cart.shipping_address) {
      cart.shipping_address = cart.billing_address
    }

    const resCart = Cart.build({
      email: cart.email,
      shop_id: cart.shop_id,
      customer_id: cart.customer_id,
      currency: cart.currency,
      notes: cart.notes,
      owners: cart.owners,
      ip: cart.ip,
      client_details: cart.client_details,
      user_id: cart.user_id
    }, {
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
    return resCart.save({transaction: options.transaction || null})
      .then(() => {
        return Cart.sequelize.Promise.mapSeries(items, item => {
          return this.app.services.ProductService.resolveItem(item, {transaction: options.transaction || null})
        })
      })
      .then(resolvedItems => {
        return Cart.sequelize.Promise.mapSeries(resolvedItems, (item, index) => {
          return resCart.addLine(item, items[index].quantity, items[index].properties)
        })
      })
      // .then(() => {
      //   return resCart.save({transaction: options.transaction || null})
      // })
      .then(() => {
        if (cart.shipping_address && !_.isEmpty(cart.shipping_address)) {
          return resCart.updateShippingAddress(
            cart.shipping_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        if (cart.billing_address) {
          return resCart.updateBillingAddress(
            cart.billing_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        return resCart.save({transaction: options.transaction || null})
      })
      .then(() => {
        return resCart.reload({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param identifier
   * @param cart
   * @param options
   * @returns {Promise<T>|Cart}
   */
  update(identifier, cart, options){
    options = options || {}
    const Cart = this.app.orm['Cart']

    let resCart
    // Only allow a few values for update since this can be done from the client side
    const update = _.pick(cart, ['customer_id', 'host', 'ip', 'update_ip', 'client_details'])
    return Cart.resolve(identifier, {transaction: options.transaction || null})
      .then(foundCart => {
        if (!foundCart) {
          throw new Error('Could not resolve Cart')
        }
        // Extend DAO with updates
        resCart = _.extend(foundCart, update)

        // Shipping Address
        if (cart.shipping_address) {
          return resCart.updateShippingAddress(
            cart.shipping_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        if (cart.billing_address) {
          return resCart.updateBillingAddress(
            cart.billing_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        return resCart.save({transaction: options.transaction || null})
      })
      .then(() => {
        return resCart
      })
  }

  /**
   *
   * @param req
   * @param options
   * @returns {Promise.<*>}
   */
  // TODO use any provided shipping/billing addresses and add them to customer address history
  checkout(req, options){
    options = options || {}
    // const Cart = this.app.orm['Cart']

    if (!req.body.cart) {
      const err = new Errors.FoundError(Error('Cart is missing in request'))
      return Promise.reject(err)
    }

    let resOrder
    return this.app.orm['Cart'].sequelize.transaction(t => {
      options.transaction = t

      return this.prepareForOrder(req, {transaction: options.transaction || null})
        .then(newOrder => {
          return this.app.services.OrderService.create(newOrder, {transaction: options.transaction || null})
        })
        .then(order => {
          if (!order) {
            throw new Error('Unexpected error during checkout')
          }
          resOrder = order
          // Close the Cart
          return this.afterOrder(req, resOrder, {transaction: options.transaction || null})
        })
        .then(() => {
          if (resOrder.customer_id) {
            // Track Event
            const event = {
              object_id: resOrder.customer_id,
              object: 'customer',
              objects: [{
                customer: resOrder.customer_id
              }, {
                order: resOrder.id
              }],
              type: 'customer.cart.checkout',
              message: `Customer Cart ${ resOrder.cart_token } checked out and created Order ${resOrder.name}`,
              data: _.omit(resOrder,['events'])
            }
            return this.app.services.ProxyEngineService.publish(event.type, event, {
              save: true,
              transaction: options.transaction || null
            })
          }
          else {
            return
          }
        })
        .then(() => {
          if (resOrder.customer_id) {
            return this.app.emails.Order.created(resOrder, {
              send_email: this.app.config.proxyCart.emails.orderCreated
            }, {
              transaction: options.transaction || null
            })
              .then(email => {
                return resOrder.notifyCustomer(email, {transaction: options.transaction || null})
              })
              .catch(err => {
                this.app.log.error(err)
                return
              })
          }
          else {
            return
          }
        })
        .then(event => {
          // Switch to a new cart
          return this.createAndSwitch(req, {transaction: options.transaction || null})
        })
        .then(newCart => {
          return {
            cart: newCart,
            order: resOrder
          }
        })
    })
  }

  /**
   *
   * @param req
   * @param options
   * @returns {Promise.<T>}
   */
  prepareForOrder(req, options) {
    options = options || {}
    const AccountService = this.app.services.AccountService
    const Cart = this.app.orm['Cart']
    const Customer = this.app.orm['Customer']
    let resCart, userID

    // Establish who placed the order
    if (req.user && req.user.id) {
      userID = req.user.id
    }

    return Cart.resolve(req.body.cart, { transaction: options.transaction || null })
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }

        if (foundCart.status !== CART_STATUS.OPEN) {
          // TODO CREATE PROPER ERROR
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = foundCart

        // if email is set, set email for the cart
        if (req.body.email) {
          resCart.email = req.body.email
        }

        // Override the previous customer id if one was provided
        if (req.body.customer && req.body.customer.id) {
          return resCart.setCustomer(req.body.customer.id, {transaction: options.transaction || null})
        }
        else if (req.body.customer_id) {
          resCart.customer_id = req.body.customer_id
          return resCart.setCustomer(req.body.customer_id, {transaction: options.transaction || null})
        }
        else {
          return
        }
      })
      .then(() => {
        if (req.body.shipping_address && !_.isEmpty(req.body.billing_address)) {
          return resCart.updateShippingAddress(req.body.shipping_address, {transaction: options.transaction || null})
        }
        return
      })
      .then(() => {
        // Resolve if there is a shipping address on the cart
        return resCart.resolveShippingAddress({transaction: options.transaction || null})
      })
      .then(() => {
        if (req.body.billing_address && !_.isEmpty(req.body.billing_address)) {
          return resCart.updateBillingAddress(req.body.billing_address, {transaction: options.transaction || null})
        }
        return
      })
      .then(() => {
        // Resolve if there is a billing address on the cart
        return resCart.resolveBillingAddress({transaction: options.transaction || null})
      })
      .then(() => {
        // Create a customer
        if (resCart.email && !resCart.customer_id) {
          return Customer.resolve({
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            shipping_address: resCart.shipping_address,
            billing_address: resCart.billing_address,
            cart: resCart
          }, {
            transaction: options.transaction || null
          })
            .then(customer => {
              resCart.customer_id = customer.id
            })
        }
        else {
          return
        }
      })
      .then(() => {
        // Resolve if there is a customer on the cart
        return resCart.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {
        // Set email possibilities
        if (!resCart.email && resCart.Customer) {
          resCart.email = resCart.Customer.email
        }

        if (!resCart.email && !resCart.Customer) {
          throw new Error('Order Missing Identifier (customer and email), please provide an email address')
        }

        // Close this cart and recalculate it
        resCart.close(CART_STATUS.CLOSED)
        return resCart.recalculate({transaction: options.transaction || null})
      })
      .then(cart => {

        if (resCart.Customer && (req.body.payment_details && req.body.payment_details.length > 0)) {
          return AccountService.resolvePaymentDetailsToSources(
              resCart.Customer,
              req.body.payment_details,
              {transaction: options.transaction || null}
            )
            .then(paymentDetails => {
              return paymentDetails
            })
        }
        else if (resCart.Customer && (req.body.payment_details && req.body.payment_details.length == 0)) {
          return resCart.Customer.getDefaultSource({ transaction: options.transaction || null})
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
          transaction_kind: req.body.transaction_kind,
          fulfillment_kind: req.body.fulfillment_kind,
          processing_method: PAYMENT_PROCESSING_METHOD.CHECKOUT,
          shipping_address: req.body.shipping_address,
          billing_address: req.body.billing_address,
          // Customer Info
          customer_id: resCart.customer_id,
          email: resCart.email || null,
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
  afterOrder(req, order, options){
    options = options || {}
    const Cart = this.app.orm['Cart']
    return Cart.resolve(req.body.cart, {transaction: options.transaction || null})
      .then(cart => {
        cart.order(order)
        return cart.save({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param overrides
   * @param id
   * @param admin
   * @param options
   * @returns {Promise}
   */
  pricingOverrides(overrides, id, admin, options){
    options = options || {}
    const Cart = this.app.orm['Cart']
    // Standardize the input
    if (_.isObject(overrides) && overrides.pricing_overrides){
      overrides = overrides.pricing_overrides
    }
    overrides = overrides.map(override => {
      // Add the admin id to the override
      override.admin_id = override.admin_id ? override.admin_id : admin.id
      // Make sure price is a number
      override.price = this.app.services.ProxyCartService.normalizeCurrency(parseInt(override.price))
      return override
    })
    let resCart
    return Cart.resolve(id, {transaction: options.transaction || null})
      .then(foundCart => {
        if (!foundCart) {
          throw new Error('Cart could not be resolved')
        }
        resCart = foundCart
        resCart.pricing_overrides = overrides
        resCart.pricing_override_id = admin.id
        return resCart.save({transaction: options.transaction || null})
      })
  }
  /**
   *
   * @param cart
   * @returns {Cart} // An instance of the Cart
   */
  //TODO
  addDiscountToCart(cart, options){
    return Promise.resolve(cart)
  }
  //TODO
  removeDiscountFromCart(cart, options){
    return Promise.resolve(cart)
  }
  //TODO
  addCouponToCart(cart, options){
    return Promise.resolve(cart)
  }
  //TODO
  removeCouponFromCart(cart, options){
    return Promise.resolve(cart)
  }
  //TODO
  addGiftCardToCart(cart, options){
    return Promise.resolve(cart)
  }
  //TODO
  removeGiftCardFromCart(cart, options){
    return Promise.resolve(cart)
  }

  /**
   *
   * @param items
   * @param cart
   * @param options
   * @returns {Promise}
   */
  addItemsToCart(items, cart, options){
    options = options || {}
    const Cart = this.app.orm['Cart']
    if (items.line_items) {
      items = items.line_items
    }
    let resCart
    return Cart.resolve(cart, { transaction: options.transaction || null })
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }
        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = foundCart
        // const minimize = _.unionBy(items, 'product_id')
        return Cart.sequelize.Promise.mapSeries(items, item => {
          return this.app.services.ProductService.resolveItem(item, {transaction: options.transaction || null})
        })
      })
      .then(resolvedItems => {
        return Cart.sequelize.Promise.mapSeries(resolvedItems, (item, index) => {
          return resCart.addLine(
            item,
            items[index].quantity,
            items[index].properties,
            {transaction: options.transaction || null}
          )
        })
      })
      .then(resolvedItems => {
        // console.log('CartService.addItemsToCart', cart)
        return resCart.save({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param items
   * @param cart
   * @param options
   * @returns {Promise}
   */
  removeItemsFromCart(items, cart, options){
    options = options || {}
    const Cart = this.app.orm['Cart']
    if (items.line_items) {
      items = items.line_items
    }
    let resCart
    return Cart.resolve(cart, {transaction: options.transaction || null})
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }
        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = foundCart
        return Cart.sequelize.Promise.mapSeries(items, item => {
          return this.app.services.ProductService.resolveItem(item, {transaction: options.transaction || null})
        })
      })
      .then(resolvedItems => {
        return Cart.sequelize.Promise.mapSeries(resolvedItems, (item, index) => {
          return resCart.removeLine(
            item,
            items[index].quantity,
            {transaction: options.transaction || null}
          )
        })
      })
      .then(resolvedItems => {
        return resCart.save({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param cart
   * @param options
   * @returns {Promise.<TResult>|*}
   */
  clearCart(cart, options){
    options = options || {}
    const Cart = this.app.orm['Cart']
    let resCart
    return Cart.resolve(cart, {transaction: options.transaction || null})
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }
        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }
        resCart = foundCart
        resCart.clear()
        return resCart.save({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param req
   * @param options
   */
  createAndSwitch(req, options){
    options = options || {}
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
    let resCart
    return this.create(cart, {transaction: options.transaction || null})
      .then(createdCart => {
        if (!createdCart) {
          throw new Error('New Cart was not able to be created')
        }
        resCart = createdCart

        if (req.user) {
          return User.findById(req.user.id, {transaction: options.transaction || null})
            .then(user => {
              user.current_cart_id = resCart.id
              return user.save({transaction: options.transaction || null})
            })
        }
        else {
          return
        }
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          req.loginCart(resCart, (err) => {
            if (err) {
              return reject(err)
            }
            return resolve(resCart)
          })
        })
      })
  }

  // switchCart(user, cart) {
  //   const User = this.app.orm['User']
  //   const Cart = this.app.orm['Cart']
  //
  //   return User.findById(user.id)
  //     .then(user => {
  //       user.current_cart_id = cart.id
  //       return user.save()
  //     })
  //     .then(user => {
  //       req.user.current_cart_id = cartId
  //       return Cart.findById(cartId)
  //     })
  //     .then(cart => {
  //       cart.customer_id = req.user.current_customer_id
  //       return cart.save()
  //     })
  // }
  /**
   *
   * @param cart
   * @param options
   * @returns {Promise.<T>}
   */
  beforeCreate(cart, options) {
    if (cart.ip) {
      cart.create_ip = cart.ip
    }
    // If not token was already created, create it
    if (!cart.token) {
      cart.token = `cart_${shortid.generate()}`
    }
    // Will return default shop if blank
    return this.app.orm['Shop'].resolve(cart.shop_id, {transaction: options.transaction || null})
      .then(shop => {
        // console.log('CartService.beforeCreate', shop)
        cart.shop_id = shop.id
        return cart.recalculate({transaction: options.transaction || null})
      })
      .catch(err => {
        // console.log('CartService.beforeCreate', err)
        return cart.recalculate({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param cart
   * @param options
   * @returns {Promise.<T>}
   */
  beforeUpdate(cart, options){
    if (cart.ip) {
      cart.update_ip = cart.ip
    }
    if (cart.status == CART_STATUS.OPEN) {
      return cart.recalculate({transaction: options.transaction || null})
    }
    else {
      return Promise.resolve(cart)
    }
  }

  /**
   *
   * @param cart
   * @param options
   * @returns {Promise.<T>}
   */
  beforeSave(cart, options){
    if (cart.status == CART_STATUS.OPEN) {
      return cart.recalculate({transaction: options.transaction || null})
    }
    else {
      return Promise.resolve(cart)
    }
  }
}

