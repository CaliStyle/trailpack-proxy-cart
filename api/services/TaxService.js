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
        return this.resolveSendFromTo(cart, shippingAddress)
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
  resolveSendFromTo(cart, shippingAddress) {
    return new Promise((resolve, reject) => {
      const Cart = this.app.services.ProxyEngineService.getModel('Cart')

      if (!(cart instanceof Cart.Instance)) {
        const err = new Error('Cart must be an instance!')
        return reject(err)
      }

      if (cart.shop_id && this.app.services.ProxyCartService.validateAddress(shippingAddress)) {
        return resolve({})
      }
      else if (cart.shop_id && cart.customer_id) {
        return resolve({})
      }
      else {
        return resolve(null)
      }
    })
  }
}

