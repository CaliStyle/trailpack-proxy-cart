'use strict'

const Service = require('trails/service')

/**
 * @module ShippingService
 * @description Shipping Service
 */
module.exports = class ShippingService extends Service {
  calculate(obj, lineItems, shippingAddress, resolver, options){
    options = options || {}
    let resObj
    return resolver.resolve(obj, {transaction: options.transaction || null})
      .then(_obj => {
        if (!_obj) {
          throw new Error('Could not resolve for shipping')
        }
        resObj = _obj
        return this.app.services.ProxyCartService.resolveItemsFromTo(resObj, lineItems.filter(i => i.requires_shipping), shippingAddress)
      })
      .then(resolvedItemsFromTo => {
        if (!resolvedItemsFromTo) {
          return resObj
        }
        return this.getShipping(resObj, lineItems, resolvedItemsFromTo, options)
      })
      .then(shippingResult => {
        return shippingResult
      })
  }

  getShipping(obj, lineItems, resolvedItemsFromTo, options) {
    options = options || {}
    // const shippingProvider = this.app.config.proxyGenerics[obj.shipping_provider]
    //   || this.app.config.get('proxyGenerics.shipping_provider')

    return Promise.resolve({
      line_items: []
    })
    // console.log('WORKING ON SHIPPING TAX FOR ORDER', obj, lineItems, sendFromTo)
    // return this.app.services.TaxGenericService.taxForOrder({
    //   nexus_addresses: resolvedItemsFromTo.nexus_addresses,
    //   to_address: resolvedItemsFromTo.to_address,
    //   line_items: lineItems,
    //   subtotal_price: obj.subtotal_price,
    //   total_shipping: obj.total_shipping
    // }, taxProvider)
  }
}

