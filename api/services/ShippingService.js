'use strict'

const Service = require('trails/service')

/**
 * @module ShippingService
 * @description Shipping Service
 */
module.exports = class ShippingService extends Service {
  calculate(obj, shippingAddress, resolver, options){
    options = options || {}
    return resolver.resolve(obj, {transaction: options.transaction || null})
      .then(obj => {
        return this.app.services.ProxyCartService.resolveSendFromTo(obj, shippingAddress)
      })
      .then(sendFromTo => {
        if (!sendFromTo) {
          return []
        }
        return this.getShipping(sendFromTo)
      })
      .then(shippingLines => {
        return obj.setShippingLines(shippingLines)
      })
  }
  getShipping(sendFromTo) {
    Promise.resolve([])
  }
}

