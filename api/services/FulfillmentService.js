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
   * @returns {Promise.<TResult>}
   */
  groupFulfillments(order, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, { transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order Not Found')
        }
        resOrder = foundOrder
        if (!resOrder.order_items) {
          return resOrder.getOrder_items()
        }
        else {
          return resOrder.order_items
        }
      })
      .then(orderItems => {
        orderItems = orderItems || []
        resOrder.set('order_items', orderItems)

        // Group by Service
        let groups = _.groupBy(orderItems, 'fulfillment_service')
        // Map into array
        groups = _.map(groups, (items, service) => {
          return { service: service, items: items }
        })
        // Create the non sent fulfillments
        return Promise.all(groups.map((group) => {
          return resOrder.createFulfillment({
            order_id: resOrder.id,
            service: group.service,
            status: FULFILLMENT_STATUS.NONE,
            total_not_fulfilled: group.items.length,
            order_items: group.items
          }, {
            include: [
              {
                model: this.app.orm['OrderItem'],
                as: 'order_items'
              }
            ]
          })
        }))
      })
      .then(fulfillments => {
        fulfillments = fulfillments || []
        resOrder.set('fulfillments', fulfillments)
        return fulfillments
      })
  }
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
    return Order.resolve(order, { transaction: options.transaction || null})
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order Not Found')
        }
        resOrder = foundOrder

        if (!resOrder.fulfillments) {
          return resOrder.getFulfillments({
            include: [
              {
                model: this.app.orm['OrderItem'],
                as: 'order_items'
              }
            ]
          })
        }
        else {
          return resOrder.fulfillments
        }
      })
      .then(fulfillments => {
        fulfillments = fulfillments || []
        resOrder.set('fulfillments', fulfillments)

        return Promise.all(fulfillments.map(fulfillment => {
          return this.sendFulfillment(resOrder, fulfillment, {transaction: options.transaction || null })
        }))
      })
      .then(fulfillments => {
        return fulfillments
      })
  }

  sendFulfillment(order, fulfillment, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    const Fulfillment = this.app.orm['Fulfillment']
    let resOrder, resFulfillment

    return Order.resolve(order, { transaction: options.transaction || null, })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order not found')
        }
        resOrder = foundOrder
        return Fulfillment.resolve(fulfillment, {transaction: options.transaction || null})
      })
      .then(foundFulfillment => {
        if (!foundFulfillment) {
          throw new Error('Fulfillment not found')
        }
        resFulfillment = foundFulfillment
        if (!resFulfillment.order_items) {
          return resFulfillment.getOrder_items()
        }
        else {
          return resFulfillment.order_items
        }
      })
      .then(orderItems => {
        orderItems = orderItems || []
        // TODO this should be part of the instance and not have to be added this way.
        resFulfillment.order_items = orderItems
        resFulfillment.set('order_items', orderItems, {raw: true})
        // If a manually supplied and a non-shippable item mark as fully fulfilled
        if (
          resFulfillment.service === FULFILLMENT_SERVICE.MANUAL
          && resFulfillment.order_items.filter(item => item.requires_shipping).length == 0
        ){
          resFulfillment.status = FULFILLMENT_STATUS.FULFILLED
          return Promise.all(resFulfillment.order_items.map(item => {
            item.fulfillment_status = resFulfillment.status
            return item.save({hooks: false})
          }))
        }
        // If a manually supplied item mark as sent to manual
        else if (resFulfillment.service === FULFILLMENT_SERVICE.MANUAL){
          resFulfillment.status = FULFILLMENT_STATUS.SENT
          return Promise.all(resFulfillment.order_items.map(item => {
            item.fulfillment_status = resFulfillment.status
            return item.save({hooks: false})
          }))
        }
        else {
          return this.app.services.FulfillmentGenericService.createOrder(resFulfillment, resFulfillment.service)
            .then(result => {
              resFulfillment.status = result.status
              return Promise.all(resFulfillment.order_items.map(item => {
                item.fulfillment_status = resFulfillment.status
                return item.save({hooks: false})
              }))
            })
        }
      })
      .then(() => {
        resFulfillment.setFulfillmentStatus()
        return resFulfillment.save()
      })
      .then(() => {
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
          type: `order.fulfillment.${resFulfillment.status}`,
          message: `Order ${resOrder.name} fulfillment ID ${resFulfillment.id} ${resFulfillment.status}`,
          data: resFulfillment
        }

        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resFulfillment
      })
  }

  // TODO
  updateFulfillment(order, fulfillment, options) {

  }
  // TODO
  cancelFulfillment(fulfillment, options) {
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

