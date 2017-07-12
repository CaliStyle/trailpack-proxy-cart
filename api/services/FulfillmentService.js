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
            total_pending_fulfillments: group.items.length,
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
          resFulfillment.fulfilled()
          return Promise.all(resFulfillment.order_items.map(item => {
            item.fulfillment_status = resFulfillment.status
            return item.save({hooks: false})
          }))
        }
        // If a manually supplied item mark as sent to manual
        else if (resFulfillment.service === FULFILLMENT_SERVICE.MANUAL){
          resFulfillment.sent()
          return Promise.all(resFulfillment.order_items.map(item => {
            item.fulfillment_status = resFulfillment.status
            return item.save({hooks: false})
          }))
        }
        else {
          return this.app.services.FulfillmentGenericService.createOrder(resFulfillment, resFulfillment.service)
            .then(result => {
              resFulfillment[result.status]()
              return Promise.all(resFulfillment.order_items.map(item => {
                item.fulfillment_status = resFulfillment.status
                return item.save({hooks: false})
              }))
            })
        }
      })
      .then(() => {
        return resFulfillment.setFulfillmentStatus().save()
        // return resFulfillment.save()
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

  /**
   *
   * @param fulfillment
   * @param options
   * @returns {Promise.<TResult>}
   */
  updateFulfillment(fulfillment, options) {
    options = options || {}
    const Fulfillment = this.app.orm['Fulfillment']
    let resFulfillment
    return Fulfillment.resolve(fulfillment, { transaction: options.transaction || null, })
      .then(foundFulfillment => {
        if (!foundFulfillment) {
          throw new Error('Fulfillment not found')
        }
        if ([FULFILLMENT_STATUS.FULFILLED, FULFILLMENT_STATUS.CANCELLED].indexOf(foundFulfillment.status) > -1) {
          throw new Error(`Fulfillment status must be ${ FULFILLMENT_STATUS.PENDING }, ${ FULFILLMENT_STATUS.NONE }, ${FULFILLMENT_STATUS.PARTIAL}, ${FULFILLMENT_STATUS.SENT} to update`)
        }
        resFulfillment = foundFulfillment
        if ([FULFILLMENT_STATUS.NONE, FULFILLMENT_STATUS.PENDING].indexOf(resFulfillment.status) > -1) {
          return
        }
        else if ([FULFILLMENT_STATUS.SENT, FULFILLMENT_STATUS.PARTIAL].indexOf(resFulfillment.status) > -1) {
          return this.app.services.FulfillmentGenericService.updateOrder(resFulfillment, resFulfillment.service)
        }
        else {
          // Unhandled
          return
        }
      })
      .then(() => {
        return resFulfillment.setFulfillmentStatus().save()
      })
  }

  /**
   *
   * @param fulfillment
   * @param options
   * @returns {Promise.<TResult>}
   */
  cancelFulfillment(fulfillment, options) {
    options = options || {}
    const Fulfillment = this.app.orm['Fulfillment']
    const OrderItem = this.app.orm['OrderItem']
    let resFulfillment
    return Fulfillment.resolve(fulfillment, { transaction: options.transaction || null, })
      .then(foundFulfillment => {
        if (!foundFulfillment) {
          throw new Error('Fulfillment not found')
        }
        if ([FULFILLMENT_STATUS.FULFILLED, FULFILLMENT_STATUS.CANCELLED].indexOf(foundFulfillment.status) > -1) {
          throw new Error(`Fulfillment status must be ${ FULFILLMENT_STATUS.PENDING }, ${ FULFILLMENT_STATUS.NONE }, ${FULFILLMENT_STATUS.PARTIAL}, ${FULFILLMENT_STATUS.SENT} to be cancelled`)
        }

        resFulfillment = foundFulfillment

        if ([FULFILLMENT_STATUS.NONE, FULFILLMENT_STATUS.PENDING].indexOf(resFulfillment.status) > -1) {
          return
        }
        else {
          return this.app.services.FulfillmentGenericService.destroyOrder(resFulfillment, resFulfillment.service)
        }
      })
      .then(() => {
        return OrderItem.update({fulfillment_status: FULFILLMENT_STATUS.CANCELLED}, {
          where: {
            fulfillment_id: resFulfillment.id
          },
          hooks: false,
          individualHooks: false,
          returning: false
        })
      })
      .then(() => {
        return resFulfillment.cancelled().save()
      })
  }

  /**
   *
   * @param item
   * @param options
   * @returns {Promise.<T>}
   */
  addOrCreateFulfillmentItem(item, options) {
    options = options || {}
    const OrderItem = this.app.orm['OrderItem']
    const Fulfillment = this.app.orm['Fulfillment']
    let resOrderItem
    return OrderItem.resolve(item, options)
      .then(foundItem => {
        if (!foundItem) {
          throw new Error('Order Item not Found')
        }
        resOrderItem = foundItem
        return Fulfillment.find({
          where: {
            order_id: resOrderItem.order_id,
            service: resOrderItem.fulfillment_service
          },
          include: [
            {
              model: OrderItem,
              as: 'order_items'
            }
          ],
          transaction: options.transaction || null
        })
      })
      .then(fulfillment => {
        if (fulfillment) {
          return fulfillment.addOrder_item(resOrderItem, {
            hooks: false,
            individualHooks: false,
            returning: false
          })
            .then(() => {
              // TODO this is messy
              resOrderItem.fulfillment_id = fulfillment.id
              const orderItems = fulfillment.order_items.concat(resOrderItem)
              fulfillment.order_items = orderItems
              fulfillment.set('order_items', orderItems)
              return this.updateFulfillment(fulfillment, options)
            })
        }
        else {
          // TODO process to send
          return Fulfillment.create({
            order_id: resOrderItem.order_id,
            service: resOrderItem.fulfillment_service,
            order_items: [resOrderItem]
          }, {
            include: [
              {
                model: OrderItem,
                as: 'order_items'
              }
            ]})
        }
      })
      .then(() => {
        return resOrderItem
      })
  }

  /**
   *
   * @param item
   * @param options
   * @returns {Promise.<TResult>}
   */
  updateFulfillmentItem(item, options) {
    options = options || {}
    const OrderItem = this.app.orm['OrderItem']
    const Fulfillment = this.app.orm['Fulfillment']
    let resOrderItem
    return OrderItem.resolve(item, options)
      .then(foundItem => {
        if (!foundItem) {
          throw new Error('Order Item not Found')
        }
        resOrderItem = foundItem
        return Fulfillment.find({
          where: {
            order_id: resOrderItem.order_id,
            service: resOrderItem.fulfillment_service
          },
          include: [
            {
              model: OrderItem,
              as: 'order_items'
            }
          ],
          transaction: options.transaction || null
        })
      })
      .then(fulfillment => {
        // TODO this is sloppy
        const index = fulfillment.order_items.findIndex(item => item.id == resOrderItem.id)
        fulfillment.order_items[index] = resOrderItem
        return this.updateFulfillment(fulfillment, options)
      })
      .then(() => {
        return resOrderItem
      })
  }

  /**
   *
   * @param item
   * @param options
   * @returns {*|Promise.<TResult>}
   */
  removeFulfillmentItem(item, options) {
    options = options || {}
    const OrderItem = this.app.orm['OrderItem']
    const Fulfillment = this.app.orm['Fulfillment']
    let resOrderItem
    return OrderItem.resolve(item, options)
      .then(foundItem => {
        if (!foundItem) {
          throw new Error('Order Item not Found')
        }
        resOrderItem = foundItem
        return Fulfillment.find({
          where: {
            order_id: resOrderItem.order_id,
            service: resOrderItem.fulfillment_service
          },
          include: [
            {
              model: OrderItem,
              as: 'order_items'
            }
          ],
          transaction: options.transaction || null
        })
      })
      .then(fulfillment => {
        // TODO, this is sloppy
        const index = fulfillment.order_items.findIndex(item => item.id == resOrderItem.id)
        fulfillment.order_items[index] = resOrderItem
        return this.updateFulfillment(fulfillment, options)
      })
      .then(() => {
        return resOrderItem
      })
  }

  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<TResult>}
   */
  // TODO
  reconcileCreate(order, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    let resOrder, noFulfillment = [], toDo = [], availablePending = [], availableUpdate = []
    return Order.resolve(order, {transaction: options.transaction || null})
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Errors.FoundError(Error('Order Not Found'))
        }
        resOrder = foundOrder
        if (!resOrder.fulfillments) {
          return resOrder.getFulfillments()
        }
        else {
          return resOrder.fulfillments
        }
      })
      .then(fulfillments => {
        fulfillments = fulfillments || []
        resOrder.set('fulfillments', fulfillments)

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

        availablePending = resOrder.fulfillments.filter(fulfillment => fulfillment.status == FULFILLMENT_STATUS.NONE)

        availableUpdate = resOrder.fulfillments.filter(fulfillment => fulfillment.status == FULFILLMENT_STATUS.SENT)

        noFulfillment = resOrder.order_items.filter(item => !item.fulfillment_id)

        noFulfillment.forEach((item, index) => {
          const allowed = availablePending.find(fulfillment => fulfillment.service === item.fulfillment_service)
          if (allowed) {
            item.fulfillment_id = allowed.id
            toDo.push(item.save())
            noFulfillment.splice(index, 1)
          }
        })

        // TODO Should Send fulfillment update
        noFulfillment.forEach((item, index) => {
          const allowed = availableUpdate.find(fulfillment => fulfillment.service === item.fulfillment_service)
          if (allowed) {
            item.fulfillment_id = allowed.id
            toDo.push(item.save())
            noFulfillment.splice(index, 1)
          }
        })

        // TODO create new fulfillment

        return Promise.all(toDo.map(item => { return item }))
      })
      .then(() => {
        return resOrder
      })
  }

  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<TResult>}
   */
  // TODO
  reconcileUpdate(order, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    let resOrder//, totalNew = 0, availablePending = []
    return Order.resolve(order, {transaction: options.transaction || null})
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Errors.FoundError(Error('Order Not Found'))
        }
        resOrder = foundOrder
        if (!resOrder.fulfillments) {
          return resOrder.getFulfillments()
        }
        else {
          return resOrder.fulfillments
        }
      })
      .then(fulfillments => {
        fulfillments = fulfillments || []
        resOrder.set('fulfillments', fulfillments)
        return
      })
      .then(() => {
        return resOrder
      })
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
            'total_pending_fulfillments'
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
            'total_pending_fulfillments'
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

