'use strict'

const Service = require('trails/service')

/**
 * @module ShippingService
 * @description Shipping Service
 */
module.exports = class ShippingService extends Service {
  calculate(obj, shippingAddress, resolver){
    return resolver.resolve(obj)
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
        obj.shipping_lines = shippingLines
        return obj
      })
  }
  getShipping(sendFromTo) {
    Promise.resolve([])
  }
}

