'use strict'

const Service = require('trails-service')

/**
 * @module CartService
 * @description Cart Service
 */
module.exports = class CartService extends Service {
  checkout(data){
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

