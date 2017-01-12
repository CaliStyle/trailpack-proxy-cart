'use strict'

const Service = require('trails/service')

/**
 * @module TaxService
 * @description Tax Service
 */
module.exports = class TaxService extends Service {
  calculate(cart, shippingAddress){
    return this.app.services.CartService.resolve(cart)
      .then(cart => {
        return this.app.services.ProxyCartService.resolveSendFromTo(cart, shippingAddress)
      })
      .then(sendFromTo => {
        if (!sendFromTo) {
          return []
        }
        return this.getTaxes(sendFromTo)
      })
      .then(taxLines => {
        return taxLines
      })
  }
  getTaxes(sendFromTo) {
    Promise.resolve([])
  }
}

