'use strict'

const Service = require('trails/service')

/**
 * @module DiscountService
 * @description Discount Service
 */
module.exports = class DiscountService extends Service {
  resolve(discount){}

  /**
   *
   * @param cart Instance
   * @returns {Promise.<TResult>}
   */
  calculate(cart){
    return this.app.services.CartService.resolve(cart)
      .then(cart => {
        return []
      })
  }
}

