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
  resolve(cart){
    const Cart =  this.app.services.ProxyEngineService.getModel('Cart')
    if (cart instanceof Cart.Instance){
      return Promise.resolve(cart)
    }
    else if (cart && _.isString(cart)) {
      return Cart.findById(cart)
    }
    else if (cart && _.isObject(cart) && cart.id) {
      return Cart.findById(cart.id)
    }
    else {
      return this.create(cart)
    }
  }
  /**
   *
   * @param data
   * @returns {Cart}
   */
  create(data){
    const Cart = this.app.services.ProxyEngineService.getModel('Cart')
    return Cart.create(data)
  }

  /**
   *
   * @param cart
   * @returns {Cart}
   */
  update(cart){
    const FootprintService = this.app.services.FootprintService
    const update = _.omit(cart,['id','created_at','updated_at'])
    return FootprintService.update('Cart', cart.id, update)
  }

  /**
   *
   * @param data
   * @returns {Promise.<*>}
   */
  checkout(data){
    return Promise.resolve(data)
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
    const FootprintService = this.app.services.FootprintService

    if (item.product_variant_id) {
      return FootprintService.find('ProductVariant', item.product_variant_id, { populate: 'images' })
    }
    else if (item.id) {
      return FootprintService.find('ProductVariant', item.id, { populate: 'images' })
    }
    else if (item.product_id) {
      return FootprintService.find('ProductVariant', {
        product_id: item.product_id,
        position: 1
      }, { populate: 'images' })
        .then(products => {
          return products[0]
        })
    }
    else {
      const err = new Errors.FoundError(Error(`${item} not found`))
      return Promise.reject(err)
    }
  }

  /**
   *
   * @param item
   * @param qty
   * @param cart
   * @returns {*}
   */
  addLine(item, qty, cart){
    if (!qty) {
      qty = 1
    }
    let cartItem = _.find(cart.line_items, {id: item.id})
    if (cartItem) {
      cartItem.quantity = cartItem.quantity + qty
    }
    else {
      cartItem = _.omit(item, [
        'position',
        'published',
        'published_at',
        'unpublished_at',
        'inventory_management',
        'inventory_policy',
        'inventory_quantity',
        'created_at',
        'updated_at'
      ])
      cartItem.quantity = qty
      cart.line_items.push(cartItem)
    }
    // console.log('LINE ITEMS', cart.line_items, cart.line_items.length)
    return cart
  }

  /**
   *
   * @param item
   * @param qty
   * @param cart
   * @returns {*}
   */
  removeLine(item, qty, cart){
    if (!qty) {
      qty = 1
    }
    let itemIndex = _.findIndex(cart.line_items, {id: item.id})
    if (itemIndex > -1) {
      cart.line_items[itemIndex].quantity = cart.line_items[itemIndex].quantity - qty
      if ( cart.line_items[itemIndex].quantity < 1) {
        cart.line_items.splice(itemIndex, 1)
      }
    }
    // console.log('LINE ITEMS', cart.line_items)
    return cart
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
            cart = _.extend(cart, this.addLine(item.get({ plain: true }), items[index].quantity, cart.get({ plain: true })))
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
            cart = _.extend(cart, this.removeLine(item.get({ plain: true }), items[index].quantity, cart.get({ plain: true })))
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

