'use strict'

const Service = require('trails/service')

/**
 * @module TaxService
 * @description Tax Service
 */
module.exports = class TaxService extends Service {
  calculate(obj, shippingAddress, resolver){
    return resolver.resolve(obj)
      .then(obj => {
        return this.app.services.ProxyCartService.resolveSendFromTo(obj, shippingAddress)
      })
      .then(sendFromTo => {
        if (!sendFromTo) {
          return []
        }
        return this.getTaxes(sendFromTo)
      })
      .then(taxLines => {
        obj.tax_lines = taxLines
        return obj
      })
  }
  getTaxes(sendFromTo) {
    Promise.resolve([])
  }
}

