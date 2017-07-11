'use strict'
const _ = require('lodash')
module.exports = class ManualFulfillmentProvider {
  constructor(options) {
    this.options = options
  }

  /**
   *
   * @param fulfillment
   * @returns {Promise.<T>}
   */
  createOrder(fulfillment){
    fulfillment.status = 'sent'
    fulfillment.order_items.map(i => {
      i.fulfillment_staus = 'sent'
      return i
    })
    return Promise.resolve(fulfillment)
  }

  /**
   *
   * @param fulfillments
   * @returns {Promise.<Array>}
   */
  createOrders(fulfillments){
    fulfillments = _.map(fulfillments, fulfillment => {
      fulfillment.status = 'sent'
      fulfillment.order_items.map(i => {
        i.fulfillment_staus = 'sent'
        return i
      })
    })
    return Promise.resolve(fulfillments)
  }

  /**
   *
   * @param fulfillment
   * @returns {Promise.<T>}
   */
  updateOrder(fulfillment){
    return Promise.resolve(fulfillment)
  }

  /**
   *
   * @param fulfillments
   * @returns {Promise.<T>}
   */
  updateOrders(fulfillments){
    return Promise.resolve(fulfillments)
  }

  /**
   *
   * @param fulfillment
   * @returns {Promise.<T>}
   */
  destroyOrder(fulfillment){
    return Promise.resolve(fulfillment)
  }

  /**
   *
   * @param fulfillments
   * @returns {Promise.<T>}
   */
  destroyOrders(fulfillments){
    return Promise.resolve(fulfillments)
  }

  /**
   *
   * @param fulfillment
   * @returns {Promise.<T>}
   */
  getOrder(fulfillment){
    return Promise.resolve(fulfillment)
  }

  /**
   *
   * @param fulfillments
   * @returns {Promise.<T>}
   */
  getOrders(fulfillments){
    return Promise.resolve(fulfillments)
  }

  /**
   *
   * @param fulfillment
   * @returns {Promise.<T>}
   */
  holdOrder(fulfillment){
    return Promise.resolve(fulfillment)
  }

  /**
   *
   * @param fulfillments
   * @returns {Promise.<T>}
   */
  holdOrders(fulfillments){
    return Promise.resolve(fulfillments)
  }
}
