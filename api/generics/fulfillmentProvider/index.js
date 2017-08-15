/* eslint no-console: [0] */
'use strict'
const Generic = require('trailpack-proxy-generics').Generic
const _ = require('lodash')
module.exports = class ManualFulfillmentProvider extends Generic {
  constructor(options) {
    super()
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
    fulfillment.order_items.map(i => {
      i.fulfillment_staus = fulfillment.status
      return i
    })
    return Promise.resolve(fulfillment)
  }

  /**
   *
   * @param fulfillments
   * @returns {Promise.<T>}
   */
  updateOrders(fulfillments){
    fulfillments = _.map(fulfillments, fulfillment => {
      fulfillment.order_items.map(i => {
        i.fulfillment_staus = fulfillment.status
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
  destroyOrder(fulfillment){
    fulfillment.status = 'cancelled'
    fulfillment.order_items.map(i => {
      i.fulfillment_staus = 'cancelled'
      return i
    })
    return Promise.resolve(fulfillment)
  }

  /**
   *
   * @param fulfillments
   * @returns {Promise.<T>}
   */
  destroyOrders(fulfillments){
    fulfillments = _.map(fulfillments, fulfillment => {
      fulfillment.status = 'cancelled'
      fulfillment.order_items.map(i => {
        i.fulfillment_staus = 'cancelled'
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
