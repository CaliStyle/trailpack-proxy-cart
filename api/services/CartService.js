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
      Promise.reject(err)
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
      .then(resolvledItems => {
        return cart.recalculate()
      })
      .then(cart => {
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
  checkout(data){
    const ProductVariant = this.app.orm.ProductVariant
    const Customer = this.app.orm['Customer']

    if (!data.cart.id) {
      const err = new Errors.FoundError(Error('Cart is missing id'))
      return Promise.reject(err)
    }

    let resCart, resCustomer
    return this.resolve(data.cart)
      .then(foundCart => {

        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }

        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        resCart = foundCart
        // console.log('CART CUSTOMER',data.customer)
        return Customer.findById(data.customer.id || resCart.customer_id)
      })
      .then(foundCustomer => {
        if (!foundCustomer) {
          this.app.log.info('Checkout without Customer')
          throw new Errors.FoundError(Error('Customer Not Found'))
        }

        resCustomer = foundCustomer

        // Resolve all Line Items, Check Restrictions, Check Availability
        return Promise.all(resCart.line_items.map(item => {
          return ProductVariant.findById(item.variant_id, {attributes: ['id']})
            .then(productVariant => {
              return productVariant.checkRestrictions(resCustomer, data.shipping_address)
                .then(restricted => {
                  if (restricted) {
                    throw new Error(`${restricted.title} can not be shipped to ${restricted.city} ${restricted.province} ${restricted.country}`)
                  }
                  return restricted
                })
                .then(restriction => {
                  return productVariant.checkAvailability()
                    .then(availability => {
                      if (!availability.allowed) {
                        throw new Error(`${availability.title} is not available in this quantity, please try a lower quantity`)
                      }
                      return availability
                    })
                })
            })
        }))
      })
      .then(restrictions => {
        // Recalculate the Cart
        return resCart.recalculate()
      })
      .then(resCart => {
        // Save the Cart
        return resCart.save()
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
          client_details: data.client_details,
          ip: data.ip,
          payment_details: data.payment_details,
          payment_kind: data.payment_kind,
          fulfillment_kind: data.fulfillment_kind,
          processing_method: PAYMENT_PROCESSING_METHOD.CHECKOUT,
          shipping_address: data.shipping_address,
          billing_address: data.billing_address
        }
        return this.app.services.OrderService.create(newOrder)
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
    return this.resolve(cart)
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }
        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        cart = foundCart
        // const minimize = _.unionBy(items, 'product_id')
        return Promise.all(items.map(item => {
          return this.resolveItem(item)
        }))
      })
      .then(resolvedItems => {
        return Promise.all(resolvedItems.map((item, index) => {
          return cart.addLine(item, items[index].quantity, items[index].properties)
        }))
      })
      .then(resolvledItems => {
        return cart.recalculate()
      })
      .then(cart => {
        // console.log('CartService.addItemsToCart', cart)
        return cart.save()
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
    return this.resolve(cart)
      .then(foundCart => {
        if (!foundCart) {
          throw new Errors.FoundError(Error('Cart Not Found'))
        }
        if (foundCart.status !== CART_STATUS.OPEN) {
          throw new Errors.FoundError(Error(`Cart is not ${CART_STATUS.OPEN}`))
        }

        cart = foundCart
        return Promise.all(items.map(item => {
          return this.resolveItem(item)
        }))
      })
      .then(resolvedItems => {
        _.each(resolvedItems, (item, index) => {
          cart.removeLine(item, items[index].quantity)
        })
        return cart.recalculate()
      })
      .then(cart => {
        return cart.save()
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
          return cart.recalculate()
        })
        .then(cart => {
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
        return cart
      })
      .catch(err => {
        // console.log('CartService.beforeCreate', err)
        return cart
      })
  }
  beforeUpdate(cart){
    if (cart.ip) {
      cart.update_ip = cart.ip
    }
    return Promise.resolve(cart)
  }
}

