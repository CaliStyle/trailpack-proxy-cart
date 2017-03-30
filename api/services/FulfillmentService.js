/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const FULFILLMENT_SERVICE = require('../utils/enums').FULFILLMENT_SERVICE
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS

/**
 * @module FulfillmentService
 * @description Fulfillment Service
 */
module.exports = class FulfillmentService extends Service {
  resolve(fulfillment){}

  fulfillOrder(order) {
    return this.app.services.OrderService.resolve(order)
      .then(order => {
        if (!order.order_items || order.order_items.length == 0) {
          return order.getOrder_items()
        }
        return order
      })
      .then(order => {
        // const groups = []
        let groups = _.groupBy(order.order_items, 'fulfillment_service')
        groups = _.map(groups, (items, service) => {
          return {service: service, items: items}
        })
        return Promise.all(groups.map((group) => {
          const items = group.items.filter(item => item.requires_shipping)
          return this.create(order, items, group.service)
        }))
      })
      .then(fulfillments => {
        return fulfillments
      })
  }
  create(order, items, service) {
    const Fulfillment = this.app.services.ProxyEngineService.getModel('Fulfillment')
    // const OrderItem = this.app.orm.OrderItem
    if (!order.id) {
      const err = new Error('Missing Order Id')
      return Promise.reject(err)
    }
    let resFulfillment
    return Promise.all(items.map(item => {
      return this.app.services.OrderService.resolveItem(item)
    }))
      .then(items => {
        // Build the base fulfillment
        const fulfillment = {
          order_id: order.id,
          order_items: items,
          service: service
        }
        if (service == FULFILLMENT_SERVICE.MANUAL) {
          fulfillment.status = FULFILLMENT_STATUS.SENT
          return fulfillment
        }
        else if (!order.has_shipping || items.filter(item => item.requires_shipping).length == 0){
          fulfillment.status = FULFILLMENT_STATUS.FULFILLED
          return fulfillment
        }
        else {
          return this.app.services.FulfillmentGenericService.createOrder(fulfillment, service)
        }
      })
      .then(fulfillment => {
        // Build the instance
        fulfillment = Fulfillment.build(fulfillment)
        // Save the instance
        return fulfillment.save()
      })
      .then(fulfillment => {
        resFulfillment = fulfillment
        // Set the order items fulfillment_id
        return Promise.all(items.map(item => {
          item.fulfillment_id = resFulfillment.id
          item.fulfillment_status = resFulfillment.status
          return item.save()
        }))
      })
      .then(items => {
        const event = {
          object_id: resFulfillment.order_id,
          object: 'order',
          type: `fulfillment.create.${resFulfillment.status}`,
          data: resFulfillment
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resFulfillment
      })
  }
}

