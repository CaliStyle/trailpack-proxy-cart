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
      return Promise.resolve(cart, options)
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
    if (!data.line_items) {
      data.line_items = []
    }

    // Remove the items from the cart creation so we can resolve them
    const items = data.line_items
    delete data.line_items

    const cart = Cart.build(data)

    return Promise.all(items.map(item => {
      return this.resolveItem(item)
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
    const Cart =  this.app.orm.Cart
    const update = _.omit(cart,['id','created_at','updated_at'])
    return Cart.findById(cart.id)
      .then(resCart => {
        return resCart.update(update, options)
      })
  }

  /**
   *
   * @param data
   * @returns {Promise.<*>}
   */
  checkout(req){
    // const ProductVariant = this.app.orm.ProductVariant
    const Customer = this.app.orm['Customer']

    if (!req.body.cart.id) {
      const err = new Errors.FoundError(Error('Cart is missing id'))
      return Promise.reject(err)
    }

    let resCart, resCustomer, resOrder
    return this.resolve(req.body.cart)
      .then(foundCart => {

        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }

        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = foundCart
        // console.log('CART CUSTOMER',data.customer)
        return Customer.findById(req.body.customer.id || resCart.customer_id)
      })
      .then(foundCustomer => {
        if (!foundCustomer) {
          this.app.log.info('Checkout without Customer')
          throw new Errors.FoundError(Error('Customer Not Found'))
        }

        resCustomer = foundCustomer

        return resCart.recalculate()
          .then(() => resCart.save())
      })
      .then(resCart => {
        // This not required for POS or Guest Checkout
        // if (!resCart.customer_id) {
        //   throw new Errors.FoundError(Error('Cart is missing customer_id'))
        // }
        // Create new Order constraints
        const newOrder = {
          cart_token: resCart.token,
          customer_id: resCustomer.id,
          client_details: req.body.client_details,
          ip: req.body.ip,
          payment_details: req.body.payment_details,
          payment_kind: req.body.payment_kind,
          fulfillment_kind: req.body.fulfillment_kind,
          processing_method: PAYMENT_PROCESSING_METHOD.CHECKOUT,
          shipping_address: req.body.shipping_address,
          billing_address: req.body.billing_address,
          email: req.body.email || resCustomer.email
        }
        return this.app.services.OrderService.create(newOrder)
      })
      .then(order => {
        if (!order) {
          throw new Error('Unexpected error during checkout')
        }
        resOrder = order

        return this.createAndSwitch(req)
      })
      .then(cart => {
        return {
          cart: cart,
          order: resOrder
        }
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
   * @param item
   * @returns {*}
   */
  resolveItem(item){
    // const FootprintService = this.app.services.FootprintService
    const Product = this.app.orm.Product
    const ProductVariant = this.app.orm.ProductVariant
    const Image = this.app.orm.ProductImage

    if (item.id || item.variant_id || item.product_variant_id) {
      const id = item.id || item.variant_id || item.product_variant_id
      return ProductVariant.findById(id, {
        include: [
          {
            model: Product,
            include: [
              {
                model: Image,
                as: 'images',
                attributes: ['src','full','thumbnail','small','medium','large','alt','position']
              }
            ]
          },
          {
            model: Image,
            as: 'images',
            attributes: ['src','full','thumbnail','small','medium','large','alt','position']
          }
        ]
      })
    }
    else if (item.product_id) {
      return ProductVariant.find({
        where: {
          product_id: item.product_id,
          position: 1
        },
        include: [
          {
            model: Product,
            include: [
              {
                model: Image,
                as: 'images',
                attributes: ['src','full','thumbnail','small','medium','large','alt','position']
              }
            ]
          },
          {
            model: Image,
            as: 'images',
            attributes: ['src','full','thumbnail','small','medium','large','alt','position']
          }
        ]
      })
    }
    else {
      const err = new Errors.FoundError(Error(`${item} not found`))
      return Promise.reject(err)
    }
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
          return this.resolveItem(item)
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
          return this.resolveItem(item)
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

