/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
/**
 * @module CartService
 * @description Cart Service
 */
module.exports = class CartService extends Service {
  resolve(cart, options){
    // console.log('TYPEOF cart',typeof cart)
    const Cart =  this.app.services.ProxyEngineService.getModel('Cart')
    if (cart instanceof Cart.Instance){
      return Promise.resolve(cart, options)
    }
    else if (cart && _.isObject(cart) && cart.id) {
      return Cart.findById(cart.id, options)
    }
    else if (cart && (_.isString(cart) || _.isNumber(cart))) {
      return Cart.findById(cart, options)
    }
    else {
      return this.create(cart, options)
    }
  }
  /**
   *
   * @param data
   * @returns {Cart}
   */
  create(data, options){
    const Cart = this.app.services.ProxyEngineService.getModel('Cart')
    return Cart.create(data, options)
  }

  /**
   *
   * @param cart
   * @returns {Cart}
   */
  update(cart, options){
    const FootprintService = this.app.services.FootprintService
    const update = _.omit(cart,['id','created_at','updated_at'])
    return FootprintService.update('Cart', cart.id, update)
  }

  /**
   *
   * @param data
   * @returns {Promise.<*>}
   */
  checkout(cart){
    if (!cart.id) {
      const err = new Errors.FoundError(Error('Cart is missing id'))
      return Promise.reject(err)
    }
    return this.resolve(cart)
      .then(cart => {
        if (!cart.customer_id) {
          throw new Errors.FoundError(Error('Cart is missing customer_id'))
        }
        const newOrder = {
          cart_token: cart.id,
          customer_id: cart.customer_id
        }
        return this.app.services.OrderService.create(newOrder)
      })
    // let resCart = {}
    // let resCustomer = {}

    // const Customer = this.app.services.ProxyEngineService.getModel('Customer')
    // const Cart = this.app.services.ProxyEngineService.getModel('Cart')

    // return this.resolve(cart.id, {
    //   include: [
    //     Customer
    //   ]
    // })
    //   .then(cart => {
    //     resCart = cart
    //     const newOrder = {
    //       customer_id: resCart.customer_id,
    //       customer: resCart.Customer,
    //       cart_id: resCart.id,
    //       cart: _.omit(resCart, ['customer'])
    //     }
    //     return this.app.services.OrderService.placeOrder(newOrder)
    //   })
    //   .then(order => {
    //     return order
    //   })
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
  // TODO refactor to sequelize
  resolveItem(item){
    // const FootprintService = this.app.services.FootprintService
    const Product = this.app.services.ProxyEngineService.getModel('Product')
    const ProductVariant = this.app.services.ProxyEngineService.getModel('ProductVariant')
    const Image = this.app.services.ProxyEngineService.getModel('ProductImage')

    if (item.id || item.product_variant_id) {
      const id = item.id ? item.id : item.product_variant_id
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
    return new Promise((resolve, reject) => {
      this.resolve(cart)
        .then(foundCart => {
          if (!foundCart) {
            const err = new Errors.FoundError(Error('Cart Not Found'))
            return reject(err)
          }
          cart = foundCart
          // const minimize = _.unionBy(items, 'product_id')
          return Promise.all(items.map(item => {
            return this.resolveItem(item)
          }))
        })
        .then(resolvedItems => {
          _.each(resolvedItems, (item, index) => {
            cart.addLine(item, items[index].quantity)
          })
          return cart.save()
        })
        .then(cart => {
          // console.log('CartService.addItemsToCart CART', cart)
          return resolve(cart)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  /**
   *
   * @param items
   * @param cart
   * @returns {Promise}
   */
  removeItemsFromCart(items, cart){
    return new Promise((resolve, reject) => {
      this.resolve(cart)
        .then(foundCart => {
          if (!foundCart) {
            const err = new Errors.FoundError(Error('Cart Not Found'))
            return reject(err)
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
          return cart.save()
        })
        .then(cart => {
          // console.log('CartService.removeItemsFromCart CART', cart)
          return resolve(cart)
        })
        .catch(err => {
          return reject(err)
        })
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
}

