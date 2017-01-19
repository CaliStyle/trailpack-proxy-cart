'use strict'
const _ = require('lodash')
module.exports = class FakeFulfillmentProvider {
  constructor(options) {
    this.options = options
  }
  createOrder(fulfillment){
    fulfillment.status = 'sent'
    return Promise.resolve(fulfillment)
  }
  createOrders(fulfillments){
    fulfillments = _.map(fulfillments, fulfillment => {
      fulfillment.status = 'sent'
    })
    return Promise.resolve(fulfillments)
  }
  updateOrder(fulfillment){
    return Promise.resolve(fulfillment)
  }
  updateOrders(fulfillments){
    return Promise.resolve(fulfillments)
  }
  destroyOrder(fulfillment){
    return Promise.resolve(fulfillment)
  }
  destroyOrders(fulfillments){
    return Promise.resolve(fulfillments)
  }
  getOrder(fulfillment){
    return Promise.resolve(fulfillment)
  }
  getOrders(fulfillments){
    return Promise.resolve(fulfillments)
  }
  holdOrder(fulfillment){
    return Promise.resolve(fulfillment)
  }
  holdOrders(fulfillments){
    return Promise.resolve(fulfillments)
  }
}
