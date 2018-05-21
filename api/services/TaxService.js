/* eslint no-console: [0] */

'use strict'

const Service = require('trails/service')

/**
 * @module TaxService
 * @description Tax Service
 */
module.exports = class TaxService extends Service {
  calculate(obj, lineItems, shippingAddress, resolver, options){
    options = options || {}
    let resObj
    return resolver.resolve(obj, {transaction: options.transaction || null})
      .then(_obj => {
        if (!_obj) {
          throw new Error('Could not resolve for taxes')
        }
        resObj = _obj
        return this.app.services.ProxyCartService.resolveItemsFromTo(resObj, lineItems.filter(i => i.requires_taxes), shippingAddress)
      })
      .then(resolvedItemsFromTo => {
        if (!resolvedItemsFromTo) {
          return resObj
        }
        return this.getTaxes(resObj, lineItems, resolvedItemsFromTo, options)
      })
      .then(taxesResult => {
        return taxesResult
      })
  }

  /**
   *
   */
  getTaxes(obj, lineItems, resolvedItemsFromTo, options) {
    options = options || {}
    const taxProvider = this.app.config.proxyGenerics[obj.tax_provider]
      || this.app.config.get('proxyGenerics.tax_provider')

    // console.log('WORKING ON TAXES TAX FOR ORDER', obj, lineItems, sendFromTo)
    return this.app.services.TaxGenericService.taxForOrder({
      nexus_addresses: resolvedItemsFromTo.nexus_addresses,
      to_address: resolvedItemsFromTo.to_address,
      line_items: lineItems,
      subtotal_price: obj.subtotal_price,
      total_shipping: obj.total_shipping
    }, taxProvider)
  }
}

