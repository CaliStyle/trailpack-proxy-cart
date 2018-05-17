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
    let resObj
    return resolver.resolve(obj, {transaction: options.transaction || null})
      .then(_obj => {
        if (!_obj) {
          throw new Error('Could not resolve for taxes')
        }
        resObj = _obj
        return this.app.services.ProxyCartService.resolveSendFromTo(resObj, shippingAddress)
      })
      .then(sendFromTo => {
        if (!sendFromTo) {
          return resObj.tax_lines || []
        }
        return this.getTaxes(resObj, sendFromTo)
      })
      .then(taxLines => {
        console.log('BROKE LINES', taxLines)
        // obj.tax_lines = taxLines
        return resObj.setTaxLines(taxLines || [])
      })
  }

  /**
   *
   * @param obj
   * @param sendFromTo
   */
  getTaxes(obj, sendFromTo) {
    // console.log('WORKING ON TAXES', obj, sendFromTo)
    console.log('WORKING ON TAXES', obj.tax_lines)
    Promise.resolve(obj.tax_lines || [])
  }
}

