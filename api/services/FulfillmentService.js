/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
// const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const FULFILLMENT_SERVICE = require('../../lib').Enums.FULFILLMENT_SERVICE
const FULFILLMENT_STATUS = require('../../lib').Enums.FULFILLMENT_STATUS
// const ORDER_FINANCIAL = require('../../lib').Enums.ORDER_FINANCIAL

/**
 * @module FulfillmentService
 * @description Fulfillment Service
 */
module.exports = class FulfillmentService extends Service {
  /**
   *
   * @param order
   * @param fulfillment
   * @param options
   * @returns {Promise.<T>}
   */
  sendFulfillment(order, fulfillment, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    const Fulfillment = this.app.orm['Fulfillment']
    let resOrder, resFulfillment

    return Order.resolve(order, {transaction: options.transaction || null})
      .then(_order => {
        if (!_order) {
          throw new Error('Order not found')
        }
        resOrder = _order
        return Fulfillment.resolve(fulfillment, {transaction: options.transaction || null})
      })
      .then(_fulfillment => {
        if (!_fulfillment) {
          throw new Error('Fulfillment not found')
        }
        resFulfillment = _fulfillment
        return resFulfillment.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {
        if (!resFulfillment.order_items) {
          throw new Error('Fulfillment missing order_items')
        }
        // If a manually supplied and a non-shippable item, mark as fully fulfilled
        if (
          resFulfillment.service === FULFILLMENT_SERVICE.MANUAL
          && !resFulfillment.order_items.some(i => i.requires_shipping === true)
        ){
          resFulfillment.fulfilled()
          return Fulfillment.sequelize.Promise.mapSeries(resFulfillment.order_items, item => {
            item.fulfillment_status = resFulfillment.status
            return item.save({
              hooks: false,
              transaction: options.transaction || null
            })
          })
        }
        // If a manually supplied and a shippable item, mark as sent to manual
        else if (
          resFulfillment.service === FULFILLMENT_SERVICE.MANUAL
          && resFulfillment.order_items.some(i => i.requires_shipping === true)
        ){
          resFulfillment.sent()
          return Fulfillment.sequelize.Promise.mapSeries(resFulfillment.order_items, item => {
            item.fulfillment_status = resFulfillment.status
            return item.save({
              hooks: false,
              transaction: options.transaction || null
            })
          })
        }
        else {
          return this.app.services.FulfillmentGenericService.createOrder(resFulfillment, resFulfillment.service)
            .then(result => {
              resFulfillment[result.status]()
              return Fulfillment.sequelize.Promise.mapSeries(resFulfillment.order_items, item => {
                item.fulfillment_status = resFulfillment.status
                return item.save({
                  hooks: false,
                  transaction: options.transaction || null
                })
              })
            })
        }
      })
      .then(() => {
        return resFulfillment.saveFulfillmentStatus({transaction: options.transaction || null})
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

        return this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
      })
      .then(event => {
        return resFulfillment
      })
  }

  /**
   *
   * @param fulfillment
   * @param options
   * @returns {Promise.<T>}
   */
  updateFulfillment(fulfillment, options) {
    options = options || {}
    const Fulfillment = this.app.orm['Fulfillment']
    let resFulfillment
    return Fulfillment.resolve(fulfillment, {transaction: options.transaction || null})
      .then(_fulfillment => {
        if (!_fulfillment) {
          throw new Error('Fulfillment not found')
        }
        if ([FULFILLMENT_STATUS.FULFILLED, FULFILLMENT_STATUS.CANCELLED].indexOf(_fulfillment.status) > -1) {
          throw new Error(`Fulfillment status must be ${ FULFILLMENT_STATUS.PENDING }, ${ FULFILLMENT_STATUS.NONE }, ${FULFILLMENT_STATUS.PARTIAL}, ${FULFILLMENT_STATUS.SENT} to update`)
        }

        resFulfillment = _fulfillment
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
        return resFulfillment.saveFulfillmentStatus({transaction: options.transaction || null})
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
    return Fulfillment.resolve(fulfillment, { transaction: options.transaction || null })
      .then(_fulfillment => {
        if (!_fulfillment) {
          throw new Error('Fulfillment not found')
        }
        if ([FULFILLMENT_STATUS.FULFILLED, FULFILLMENT_STATUS.CANCELLED].indexOf(_fulfillment.status) > -1) {
          throw new Error(`Fulfillment status must be ${ FULFILLMENT_STATUS.PENDING }, ${ FULFILLMENT_STATUS.NONE }, ${FULFILLMENT_STATUS.PARTIAL}, ${FULFILLMENT_STATUS.SENT} to be cancelled`)
        }

        resFulfillment = _fulfillment

        return resFulfillment.resolveOrderItems({transaction: options.transaction || null,})
      })
      .then(() => {
        if ([FULFILLMENT_STATUS.NONE, FULFILLMENT_STATUS.PENDING].indexOf(resFulfillment.status) > -1) {
          return
        }
        else if (resFulfillment.service === FULFILLMENT_SERVICE.MANUAL) {
          return
        }
        else {
          return this.app.services.FulfillmentGenericService.destroyOrder(resFulfillment, resFulfillment.service)
        }
      })
      .then(() => {
        resFulfillment.cancelled()
        return resFulfillment.fulfillUpdate(
          {status: FULFILLMENT_STATUS.CANCELLED },
          {transaction: options.transaction || null}
        )
      })
      .then(() => {
        return resFulfillment.save({transaction: options.transaction || null})
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
    return OrderItem.resolve(item, {transaction: options.transaction || null})
      .then(_item => {
        if (!_item) {
          throw new Errors.FoundError('Order Item not Found')
        }
        resOrderItem = _item
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
      .then(_fulfillment => {
        if (_fulfillment) {
          resFulfillment = _fulfillment
          return resFulfillment.addOrder_item(resOrderItem, {
            hooks: false,
            individualHooks: false,
            returning: false,
            transaction: options.transaction || null
          })
            .then(() => {
              return resFulfillment.reload({transaction: options.transaction || null})
                .then(() => {
                  return resFulfillment.saveFulfillmentStatus({transaction: options.transaction || null})
                })
            })
            .then(() => {
              return this.updateFulfillment(resFulfillment, {transaction: options.transaction || null})
            })
        }
        else {
          resFulfillment = Fulfillment.build({
            order_id: resOrderItem.order_id,
            service: resOrderItem.fulfillment_service,
            // order_items: [
            //   resOrderItem
            // ]
          }, {
            include: [
              {
                model: OrderItem,
                as: 'order_items'
              }
            ]})
          // console.log('addOrCreateFulfillment Creating...', resOrderItem, resFulfillment)
          return resFulfillment.save({transaction: options.transaction || null})
            .then(() => {
              return resFulfillment.addOrder_item(resOrderItem, {
                hooks: false,
                individualHooks: false,
                returning: false,
                transaction: options.transaction || null
              })
                .then(() => {
                  return resFulfillment.reload({transaction: options.transaction || null})
                    .then(() => {
                      return resFulfillment.saveFulfillmentStatus({transaction: options.transaction || null})
                    })
                })
                .then(() => {
                  return this.updateFulfillment(resFulfillment, {transaction: options.transaction || null})
                })
            })
            // .then(() => {
            //   return resFulfillment.reload({transaction: options.transaction || null})
            // })
            // .then(() => {
            //   return resFulfillment.saveFulfillmentStatus({transaction: options.transaction || null})
            // })
        }
      })
      .then(() => {
        return resOrderItem.reload({transaction: options.transaction || null})
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
      .then(_item => {
        if (!_item) {
          throw new Errors.FoundError('Order Item not Found')
        }
        resOrderItem = _item
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
      .then(_item => {
        if (!_item) {
          throw new Error('Order Item not Found')
        }
        resOrderItem = _item
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
        return resFulfillment.hasOrder_item(resOrderItem, {transaction: options.transaction || null})
      })
      .then(hasOrderItem => {
        if (hasOrderItem && resOrderItem.quantity === 0) {
          return resFulfillment.removeOrder_item(resOrderItem, {
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
        return resOrderItem
      })
  }

  /**
   *
   * @param fulfillment
   * @param options
   * @returns {Promise.<T>}
   */
  manualUpdateFulfillment(fulfillment, options) {
    options = options || {}
    const Fulfillment = this.app.orm['Fulfillment']
    let resFulfillment
    return Fulfillment.resolve(fulfillment, {transaction: options.transaction || null})
      .then(_fulfillment => {
        if (!_fulfillment) {
          throw new Error('Fulfillment not found')
        }
        resFulfillment = _fulfillment
        return resFulfillment.fulfillUpdate(
          fulfillment,
          {transaction: options.transaction || null}
        )
      })
      .then((_update) => {
        return resFulfillment.save({transaction: options.transaction || null})
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
    return fulfillment.reconcileFulfillmentStatus({transaction: options.transaction || null})
  }

  /**
   *
   * @param fulfillment
   * @param options
   * @returns {Promise.<TResult>}
   */
  afterUpdate(fulfillment, options) {
    return fulfillment.reconcileFulfillmentStatus({transaction: options.transaction || null})
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

