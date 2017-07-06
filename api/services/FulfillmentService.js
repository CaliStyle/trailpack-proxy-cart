/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
// const Errors = require('proxy-engine-errors')
const FULFILLMENT_SERVICE = require('../utils/enums').FULFILLMENT_SERVICE
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
// const ORDER_FINANCIAL = require('../utils/enums').ORDER_FINANCIAL

/**
 * @module FulfillmentService
 * @description Fulfillment Service
 */
module.exports = class FulfillmentService extends Service {
  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<T>}
   */
  sendOrderToFulfillment(order, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, options)
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order Not Found')
        }
        resOrder = foundOrder
        return resOrder.getOrder_items()
      })
      .then(orderItems => {
        let groups = _.groupBy(orderItems, 'fulfillment_service')
        groups = _.map(groups, (items, service) => {
          return { service: service, items: items }
        })
        return Promise.all(groups.map((group) => {
          return this.create(resOrder, group.items, group.service, {transaction: options.transaction || null})
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
   * @param options
   * @returns {Promise.<T>}
   */
  create(order, items, service, options) {
    options = options || {}
    const Fulfillment = this.app.orm['Fulfillment']
    const Order = this.app.orm['Order']
    const OrderItem = this.app.orm['OrderItem']
    let resOrder, resFulfillment, resItems

    if (!order || !items || !service) {
      throw new Error('Fulfillment.create requires an order, items, and a service')
    }
    // Resolve the Order
    return Order.resolve(order, {transaction: options.transaction || null})
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order not found')
        }
        resOrder = foundOrder
        // Resolve instance of each item
        return Promise.all(items.map(item => {
          return OrderItem.resolve(item, {transaction: options.transaction || null})
        }))
      })
      .then(foundItems => {
        if (!foundItems) {
          throw new Error('Items not Found')
        }
        // set the resulting items
        resItems = foundItems

        // Build the base fulfillment
        resFulfillment = Fulfillment.build({
          order_id: resOrder.id,
          order_items: resItems,
          service: service
        }, {
          include: [{
            model: OrderItem,
            as: 'order_items'
          }]
        })

        // If a manually supplied and a non-shippable item mark as fully fulfilled
        if (
          service === FULFILLMENT_SERVICE.MANUAL
          && resItems.filter(item => item.requires_shipping).length == 0
        ){
          resFulfillment.status = FULFILLMENT_STATUS.FULFILLED
          resFulfillment.order_items.map(item => {
            item.fulfillment_status = resFulfillment.status
            return item
          })
          return resFulfillment
        }
        // If a manually supplied item mark as sent to manual
        else if (service === FULFILLMENT_SERVICE.MANUAL){
          resFulfillment.status = FULFILLMENT_STATUS.SENT
          resFulfillment.order_items.map(item => {
            item.fulfillment_status = resFulfillment.status
            return item
          })
          return resFulfillment
        }
        else {
          return this.app.services.FulfillmentGenericService.createOrder(resFulfillment, service)
        }
      })
      .then(() => {
        // Persist the instance
        return resFulfillment.save()
      })
      .then(() => {
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
        resFulfillment.set('order_items', updatedItems)

        const event = {
          object_id: resFulfillment.order_id,
          object: 'order',
          objects: [{
            order: resOrder.id
          },{
            customer: resOrder.customer_id
          },{
            fulfillment: resFulfillment.id
          }],
          type: `order.fulfillment.create.${resFulfillment.status}`,
          message: `Order ${resOrder.name} fulfillment created and ${resFulfillment.status}`,
          data: resFulfillment
        }

        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resFulfillment
      })
  }


  // TODO
  cancel(fulfillment, options) {
    options = options || {}
    return Promise.resolve(fulfillment)
  }


  beforeCreate(fulfillment, options){
    return Promise.resolve(fulfillment)
  }
  beforeUpdate(fulfillment, options){
    return Promise.resolve(fulfillment)
  }

  /**
   *
   * @param fulfillment
   * @param options
   * @returns {Promise.<TResult>}
   */
  afterCreate(fulfillment, options) {
    const Order = this.app.orm['Order']
    // console.log('BROKE', fulfillment)
    return fulfillment.resolveFulfillmentStatus({transaction: options.transaction || null})
      .then(fulfillment => {
        return Order.findById(fulfillment.order_id, {
          include: [
            {
              model: this.app.orm['Transaction'],
              as: 'transactions'
            },
            {
              model: this.app.orm['OrderItem'],
              as: 'order_items'
            },
            {
              model: this.app.orm['Fulfillment'],
              as: 'fulfillments'
            }
          ],
          attributes: [
            'id',
            'fulfillment_status',
            'financial_status',
            'total_due',
            'total_price',
            'total_fulfilled_fulfillments',
            'total_partial_fulfillments',
            'total_sent_fulfillments',
            'total_cancelled_fulfillments',
            'total_not_fulfilled'
          ],
          transaction: options.transaction || null
        })
      })
      .then(order => {
        if (order) {
          return order.saveFulfillmentStatus({transaction: options.transaction || null})
            .catch(err => {
              this.app.log.error(err)
              return fulfillment
            })
        }
        else {
          return
        }
      })
      .then(() => {
        return fulfillment
      })
  }

  /**
   *
   * @param fulfillment
   * @param options
   * @returns {Promise.<TResult>}
   */
  afterUpdate(fulfillment, options) {
    const Order = this.app.orm['Order']

    return fulfillment.resolveFulfillmentStatus({transaction: options.transaction || null})
      .then(fulfillment => {
        return Order.findById(fulfillment.order_id, {
          include: [
            {
              model: this.app.orm['Transaction'],
              as: 'transactions'
            },
            {
              model: this.app.orm['OrderItem'],
              as: 'order_items'
            },
            {
              model: this.app.orm['Fulfillment'],
              as: 'fulfillments'
            }
          ],
          attributes: [
            'id',
            'financial_status',
            'fulfillment_status',
            'total_due',
            'total_price',
            'total_fulfilled_fulfillments',
            'total_partial_fulfillments',
            'total_sent_fulfillments',
            'total_cancelled_fulfillments',
            'total_not_fulfilled'
          ],
          transaction: options.transaction || null
        })
      })
      .then(order => {
        if (order) {
          return order.saveFulfillmentStatus({transaction: options.transaction || null})
            .catch(err => {
              this.app.log.error(err)
              return fulfillment
            })
        }
        else {
          return
        }
      })
      .then(() => {
        return fulfillment
      })
  }

  beforeEventCreate(fulfillment, options){
    return Promise.resolve(fulfillment)
  }
  beforeEventUpdate(fulfillment, options){
    return Promise.resolve(fulfillment)
  }

  afterEventCreate(fulfillment, options){
    return Promise.resolve(fulfillment)
  }
  afterEventUpdate(fulfillment, options){
    return Promise.resolve(fulfillment)
  }
}

