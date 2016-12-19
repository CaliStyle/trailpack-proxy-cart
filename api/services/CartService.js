/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
/**
 * @module CartService
 * @description Cart Service
 */
module.exports = class CartService extends Service {
  create(data){
    const FootprintService = this.app.services.FootprintService
    return FootprintService.create('Cart', data)
  }
  update(cart){
    const FootprintService = this.app.services.FootprintService
    const update = _.omit(cart,['id','created_at','updated_at'])
    return FootprintService.update('Cart', cart.id, update)
  }
  checkout(data){
    return Promise.resolve(data)
  }
  resolve(cart){
    if (cart && cart.id) {
      return Promise.resolve(cart)
    }
    else {
      return this.create(cart)
    }
  }
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
  resolveItem(item){
    const FootprintService = this.app.services.FootprintService

    if (item.product_variant_id) {
      return FootprintService.find('ProductVariant', item.product_variant_id)
    }
    else if (item.id) {
      return FootprintService.find('ProductVariant', item.id)
    }
    else if (item.product_id) {
      return FootprintService.find('ProductVariant', {
        product_id: item.product_id,
        position: 1
      })
        .then(products => {
          return products[0]
        })
    }
    else {
      // TODO Create a proper Error
      const err = new Error(`${item} not found`)
      return Promise.reject(err)
    }
  }
  addLine(item, qty, cart){
    if (!qty) {
      qty = 1
    }
    let cartItem = _.find(cart.line_items, {id: item.id})
    if (cartItem) {
      // console.log('NOT NEW')
      cartItem.quantity = cartItem.quantity + qty
    }
    else {
      // console.log('OMIT YO')
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
  addItemsToCart(items, cart){
    return new Promise((resolve, reject) => {
      this.resolve(cart)
        .then(foundCart => {
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
          console.log('CartService.addItemsToCart CART', cart)
          return resolve(cart)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  removeItemsFromCart(data, cart){
    return Promise.resolve(data)
  }
  clearCart(data){
    return Promise.resolve(data)
  }
}

