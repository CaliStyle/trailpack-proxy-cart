'use strict'

const Service = require('trails/service')
const _ = require('lodash')
// const Errors = require('proxy-engine-errors')
/**
 * @module CustomerService
 * @description Customer Service
 */
module.exports = class CustomerService extends Service {
  addCartToCustomer(customer, cart){
    return new Promise((resolve, reject) => {
      const FootprintService = this.app.services.FootprintService
      const customerId = _.isObject(customer) ? customer.id : customer
      const cartId = _.isObject(cart) ? cart.id : cart

      if (!customerId || !cartId) {
        // TODO Create Proper Error
        const err = new Error(`Can not Associate ${customerId} with ${cartId} because it is invalid`)
        return reject(err)
      }
      FootprintService.find('Customer', customerId)
        .then(customer => {
          return customer.addCart(cartId)
        })
        .then(updatedCustomer => {
          return updatedCustomer
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
}

