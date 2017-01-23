'use strict'

const Service = require('trails/service')

/**
 * @module DiscountService
 * @description Discount Service
 */
module.exports = class DiscountService extends Service {
  resolve(discount){}
  calculate(cart){
    return this.app.services.CartService.resolve(cart)
      .then(cart => {
        return []
      })
  }
}

