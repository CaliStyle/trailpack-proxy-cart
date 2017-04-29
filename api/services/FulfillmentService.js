/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const FULFILLMENT_SERVICE = require('../utils/enums').FULFILLMENT_SERVICE
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
// const ORDER_FINANCIAL = require('../utils/enums').ORDER_FINANCIAL

/**
 * @module FulfillmentService
 * @description Fulfillment Service
 */
module.exports = class FulfillmentService extends Service {
  resolve(fulfillment, options){
    const Fulfillment =  this.app.orm.Fulfillment
    if (fulfillment instanceof Fulfillment.Instance){
      return Promise.resolve(fulfillment)
    }
    else if (fulfillment && _.isObject(fulfillment) && fulfillment.id) {
      return Fulfillment.findById(fulfillment.id, options)
        .then(resFulfillment => {
          if (!resFulfillment) {
            throw new Errors.FoundError(Error(`Fulfillment ${fulfillment.id} not found`))
          }
          return resFulfillment
        })
    }
    else if (fulfillment && (_.isString(fulfillment) || _.isNumber(fulfillment))) {
      return Fulfillment.findById(fulfillment, options)
        .then(resFulfillment => {
          if (!resFulfillment) {
            throw new Errors.FoundError(Error(`Fulfillment ${fulfillment} not found`))
          }
          return resFulfillment
        })
    }
    else {
      const err = new Error('Unable to resolve Fulfillment')
      Promise.reject(err)
    }
  }

  sendOrderToFulfillment(order) {
    return this.app.services.OrderService.resolve(order)
      .then(order => {
        if (!order.order_items || order.order_items.length == 0) {
          return order.getOrder_items()
        }
        return order
      })
      .then(order => {
        let groups = _.groupBy(order.order_items, 'fulfillment_service')
        groups = _.map(groups, (items, service) => {
          return { service: service, items: items }
        })
        return Promise.all(groups.map((group) => {
          return this.create(order, group.items, group.service)
        }))
      })
      .then(fulfillments => {
        return fulfillments
      })
  }

  /**
   *
   * @param order
   * @param items
   * @param service
   * @returns {*}
   */
  create(order, items, service) {
    const Fulfillment = this.app.orm['Fulfillment']
    // const OrderItem = this.app.orm['OrderItem']
    let resOrder, resFulfillment, resItems

    if (!order || !items || !service) {
      throw new Error('Fulfillment.create requires an order, items, and a service')
    }
    // Resolve the Order
    return this.app.services.OrderService.resolve(order)
      .then(order => {
        resOrder = order
        // Resolve instance of each item
        return Promise.all(items.map(item => {
          return this.app.services.OrderService.resolveItem(item)
        }))
      })
      .then(items => {
        // set the resulting items
        resItems = items

        // Build the base fulfillment
        const fulfillment = {
          order_id: resOrder.id,
          order_items: resItems,
          service: service
        }

        // If a manually supplied and downloadable item
        if (
          service == FULFILLMENT_SERVICE.MANUAL
          && resItems.filter(item => item.requires_shipping).length == 0
        ){
          fulfillment.status = FULFILLMENT_STATUS.FULFILLED
          return fulfillment
        }
        else if (service == FULFILLMENT_SERVICE.MANUAL){
          fulfillment.status = FULFILLMENT_STATUS.SENT
          return fulfillment
        }
        else {
          return this.app.services.FulfillmentGenericService.createOrder(fulfillment, service)
        }
      })
      .then(fulfillment => {
        // Build the instance
        return Fulfillment.create(fulfillment)
      })
      .then(fulfillment => {
        if (!fulfillment) {
          throw new Error('Fulfillment instance was not created')
        }
        resFulfillment = fulfillment

        // Add the items to the instance
        return Promise.all(resItems.map(item => {
          // Set the Current Status
          item.fulfillment_status = resFulfillment.status
          // Set the Fulfillment id
          item.fulfillment_id = resFulfillment.id
          return item.save()
        }))
      })
      .then(updatedItems => {
        resItems = updatedItems

        const event = {
          object_id: resFulfillment.order_id,
          object: 'order',
          type: `order.fulfillment.create.${resFulfillment.status}`,
          message: `Order fulfillment created ${resFulfillment.status}`,
          data: resFulfillment
        }

        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resFulfillment
      })
  }
  beforeCreate(fulfillment){
    const Order = this.app.orm['Order']
    // console.log('BROKE', fulfillment)
    return fulfillment.resolveFulfillmentStatus()
      .then(fulfillment => {
        return Order.findById(fulfillment.order_id, {
          attributes: [
            'id',
            'financial_status',
            'total_due',
            'total_price'
          ]
        })
      })
      .then(order => {
        return order.saveFulfillmentStatus()
      })
      .then(order => {
        return fulfillment
      })
  }
  beforeUpdate(fulfillment){
    const Order = this.app.orm['Order']

    return fulfillment.resolveFulfillmentStatus()
      .then(fulfillment => {
        return Order.findById(fulfillment.order_id, {
          attributes: [
            'id',
            'financial_status',
            'total_due',
            'total_price'
          ]
        })
      })
      .then(order => {
        return order.saveFulfillmentStatus()
      })
      .then(order => {
        return fulfillment
      })
  }
  afterCreate(fulfillment) {
    return Promise.resolve(fulfillment)
  }
  afterUpdate(fulfillment) {
    return Promise.resolve(fulfillment)
  }
}

