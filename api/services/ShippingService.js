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
        return this.app.services.ProxyCartService.resolveSendFromTo(cart, shippingAddress)
      })
      .then(sendFromTo => {
        if (!sendFromTo) {
          return []
        }
        return this.getShipping(sendFromTo)
      })
      .then(taxLines => {
        return taxLines
      })
  }
  getShipping(sendFromTo) {
    Promise.resolve([])
  }
}

