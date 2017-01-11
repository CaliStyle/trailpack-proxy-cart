'use strict'

const Service = require('trails/service')

/**
 * @module ShippingService
 * @description Shipping Service
 */
module.exports = class ShippingService extends Service {
  calculate(cart, shippingAddress){
    return this.app.services.CartService.resolve(cart)
      .then(cart => {
        if (cart.customer_id && cart.shop_id) {
          return {}
        }
        else {
          // Still Unknown
          return {}
        }
      })
  }
}

