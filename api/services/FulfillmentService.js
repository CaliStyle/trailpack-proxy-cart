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
        return resOrder.resolveOrderItems(options)
      })
      .then(() => {
        return resOrder.resolveFulfillments()
      })
      .then(() => {

        // Group by Service
        let groups = _.groupBy(resOrder.order_items, 'fulfillment_service')
        // Map into array
        groups = _.map(groups, (items, service) => {
          return { service: service, items: items }
        })
        // Create the non sent fulfillments
        return Promise.all(groups.map((group) => {
          const resFulfillment = resOrder.fulfillments.find(fulfillment => fulfillment.service == group.service)
          return resFulfillment.addOrder_items(group.items, {hooks: false, individualHooks: false, returning: false })
            .then(() => {
              return resFulfillment.reload()
            })
            // .then(() => {
            //   return resFulfillment.saveFulfillmentStatus()
            // })
        }))
      })
      .then((fulfillments) => {
        fulfillments = fulfillments || []
        resOrder.setDataValue('fulfillments', fulfillments)
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

        return resOrder.resolveFulfillments({ transaction: options.transaction || null })
      })
      .then(() => {
        return Promise.all(resOrder.fulfillments.map(fulfillment => {
          return this.sendFulfillment(resOrder, fulfillment, { transaction: options.transaction || null })
        }))
      })
      .then(fulfillments => {
        fulfillments = fulfillments || []
        resOrder.setDataValue('fulfillments', fulfillments)
        resOrder.set('fulfillments', fulfillments)

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
        // console.log('BROKE THIS',fulfillment, foundFulfillment)
        return resFulfillment.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {
        // console.log('broke', resFulfillment.order_items)
        if (!resFulfillment.order_items) {
          throw new Error('Fulfillment missing order_items')
        }
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
        return resFulfillment.saveFulfillmentStatus()
      })
      .then(() => {
        // TODO, put this in life cycle
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
        return resFulfillment.saveFulfillmentStatus()
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

        return resFulfillment.resolveOrderItems({transaction: options.transaction || null,})
      })
      .then(() => {
        if ([FULFILLMENT_STATUS.NONE, FULFILLMENT_STATUS.PENDING].indexOf(resFulfillment.status) > -1) {
          return
        }
        else if (resFulfillment.service == FULFILLMENT_SERVICE.MANUAL) {
          return
        }
        else {
          return this.app.services.FulfillmentGenericService.destroyOrder(resFulfillment, resFulfillment.service)
        }
      })
      .then(() => {
        resFulfillment.cancelled()
        return resFulfillment.fulfill({status: FULFILLMENT_STATUS.CANCELLED })
      })
      .then(() => {
        return resFulfillment.save()
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
    let resOrderItem, resFulfillment
    return OrderItem.resolve(item, options)
      .then(foundItem => {
        if (!foundItem) {
          throw new Errors.FoundError('Order Item not Found')
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
          resFulfillment = fulfillment
          return resFulfillment.addOrder_item(resOrderItem, {
            hooks: false,
            individualHooks: false,
            returning: false
          })
            .then(() => {
              return resFulfillment.reload()
                .then(() => {
                  return resFulfillment.saveFulfillmentStatus()
                })
            })
            .then(() => {
              return this.updateFulfillment(resFulfillment, {transaction: options.transaction || null})
            })
        }
        else {
          // TODO process to send
          resFulfillment = Fulfillment.build({
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
          return resFulfillment.save()
            .then(() => {
              return resFulfillment.reload()
            })
            .then(() => {
              return resFulfillment.saveFulfillmentStatus()
            })
        }
      })
      .then(() => {
        return resOrderItem.reload()
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
    let resOrderItem, resFulfillment
    return OrderItem.resolve(item, {transaction: options.transaction || null})
      .then(foundItem => {
        if (!foundItem) {
          throw new Errors.FoundError('Order Item not Found')
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
        if (!fulfillment) {
          throw new Errors.FoundError('Fulfillment not found')
        }
        resFulfillment = fulfillment
        return resFulfillment.hasOrder_item(resOrderItem.id, {transaction: options.transaction || null})
      })
      .then(hasOrderItem => {
        if (!hasOrderItem) {
          return resFulfillment.addOrder_item(resOrderItem, {
            hooks: false,
            individualHooks: false,
            returning: false,
            transaction: options.transaction || null
          })
        }
        else {
          return
        }
      })
      .then(() => {
        return resFulfillment.reload({transaction: options.transaction || null})
      })
      .then(() => {
        return resFulfillment.saveFulfillmentStatus({transaction: options.transaction || null})
      })
      .then(() => {
        return this.updateFulfillment(resFulfillment, {transaction: options.transaction || null})
      })
      .then(() => {
        return resOrderItem.reload({transaction: options.transaction || null})
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
    let resOrderItem, resFulfillment
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
        if (!fulfillment) {
          throw new Errors.FoundError('Fulfillment not found')
        }
        resFulfillment = fulfillment
        return resFulfillment.hasOrder_item(resOrderItem)
      })
      .then(hasOrderItem => {
        if (hasOrderItem && resOrderItem.quantity === 0) {
          return resFulfillment.removeOrder_item(resOrderItem, {
            hooks: false,
            individualHooks: false,
            returning: false
          })
        }
        else {
          return
        }
      })
      .then(() => {
        return resFulfillment.reload()
      })
      .then(() => {
        return resFulfillment.saveFulfillmentStatus({transaction: options.transaction || null})
      })
      .then(() => {
        return this.updateFulfillment(resFulfillment, {transaction: options.transaction || null})
      })
      .then(() => {
        return resOrderItem
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
    return fulfillment.reconcileFulfillmentStatus()
  }

  /**
   *
   * @param fulfillment
   * @param options
   * @returns {Promise.<TResult>}
   */
  afterUpdate(fulfillment, options) {
    return fulfillment.reconcileFulfillmentStatus()
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

