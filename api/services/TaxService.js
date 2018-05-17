/* eslint no-console: [0] */

'use strict'

const Service = require('trails/service')

/**
 * @module TaxService
 * @description Tax Service
 */
module.exports = class TaxService extends Service {
  calculate(obj, shippingAddress, resolver, options){
    options = options || {}
    return resolver.resolve(obj, {transaction: options.transaction || null})
      .then(obj => {
        return this.app.services.ProxyCartService.resolveSendFromTo(obj, shippingAddress)
      })
      .then(sendFromTo => {
        console.log('WORKING ON TAXES', sendFromTo)
        if (!sendFromTo) {
          return []
        }
        return this.getTaxes(sendFromTo)
      })
      .then(taxLines => {
        // obj.tax_lines = taxLines
        return obj.setTaxLines(taxLines)
      })
  }

  getTaxes(sendFromTo) {
    console.log('WORKING ON TAXES', sendFromTo)
    Promise.resolve([])
  }
}

