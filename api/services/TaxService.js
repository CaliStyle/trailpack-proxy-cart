'use strict'

const Service = require('trails/service')

/**
 * @module TaxService
 * @description Tax Service
 */
module.exports = class TaxService extends Service {
  calculate(cart){
    return this.app.services.CartService.resolve(cart)
      .then(cart => {
        if (cart.customer_id && cart.shop_id) {
          return {}
        }
        else {
          return {}
        }
      })
  }
}

