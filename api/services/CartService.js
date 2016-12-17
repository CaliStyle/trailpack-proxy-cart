'use strict'

const Service = require('trails-service')

/**
 * @module CartService
 * @description Cart Service
 */
module.exports = class CartService extends Service {
  create(data){
    const FootprintService = this.app.services.FootprintService
    return FootprintService.create('Cart', data)
  }
  checkout(data){
    return Promise.resolve(data)
  }
  addDiscountToCart(data){
    return Promise.resolve(data)
  }
  addCouponToCart(data){
    return Promise.resolve(data)
  }
  addGiftCardToCart(data){
    return Promise.resolve(data)
  }
  addItemsToCart(data){
    return Promise.resolve(data)
  }
  removeItemsFromCart(data){
    return Promise.resolve(data)
  }
  clearCart(data){
    return Promise.resolve(data)
  }
}

