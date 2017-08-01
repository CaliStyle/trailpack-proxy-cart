/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const shortid = require('shortid')
const moment = require('moment')
const Errors = require('proxy-engine-errors')
const SUBSCRIPTION_CANCEL = require('../utils/enums').SUBSCRIPTION_CANCEL
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD
const ORDER_FINANCIAL = require('../utils/enums').ORDER_FINANCIAL

/**
 * @module SubscriptionService
 * @description Subscription Service
 */
module.exports = class SubscriptionService extends Service {
  generalStats() {
    const Subscription = this.app.orm['Subscription']
    let totalSubscriptions = 0
    let totalActiveSubscriptions = 0
    let totalDeactivatedSubscriptions = 0
    let totalCancelledSubscriptions = 0
    let totalActiveValue = 0
    let totalDeactivatedValue = 0
    let totalCancelledValue = 0

    return Subscription.count()
      .then(total => {
        totalSubscriptions = total

        return Subscription.count({
          where: {
            active: true
          }
        })
      })
      .then(total => {
        totalActiveSubscriptions = total

        return Subscription.count({
          where: {
            active: false,
            cancelled: false
          }
        })
      })
      .then(total => {
        totalDeactivatedSubscriptions = total

        return Subscription.count({
          where: {
            cancelled: true
          }
        })
      })
      .then(total => {
        totalCancelledSubscriptions = total

        return Subscription.sum('total_price',{
          where: {
            active: true
          }
        })
      })
      .then(total => {
        totalActiveValue = total

        return Subscription.sum('total_price',{
          where: {
            cancelled: true
          }
        })
      })
      .then(total => {
        totalCancelledValue = total

        return Subscription.sum('total_price',{
          where: {
            active: true,
            cancelled: false
          }
        })
      })
      .then(total => {
        totalDeactivatedValue = total

        const stats = {
          total: totalSubscriptions,
          total_active: totalActiveSubscriptions,
          total_deactivated: totalDeactivatedSubscriptions,
          total_cancelled: totalCancelledSubscriptions,
          total_active_value: totalActiveValue,
          total_deactivated_value: totalDeactivatedValue,
          total_cancelled_value: totalCancelledValue
        }

        return stats
      })
  }
  /**
   *
   * @param order
   * @param active
   * @param options
   * @returns {Promise.<T>}
   */
  setupSubscriptions(order, active, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    const Sequelize = Order.sequelize

    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null})
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order nto found')
        }
        resOrder = foundOrder
        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {

        const orderItems = _.filter(resOrder.order_items, 'requires_subscription')

        const groups = []
        const units = _.groupBy(orderItems, 'subscription_unit')

        _.forEach(units, function(value, unit) {
          const intervals = _.groupBy(units[unit], 'subscription_interval')
          _.forEach(intervals, (items, interval) => {
            groups.push({
              unit: unit,
              interval: interval,
              items: items
            })
          })
        })
        return Sequelize.Promise.mapSeries(groups, group => {
          return this.create(
            resOrder,
            group.items,
            group.unit,
            group.interval,
            active,
            { transaction: options.transaction || null}
          )
        })
      })
  }

  /**
   *
   * @param order
   * @param items
   * @param unit
   * @param interval
   * @param active
   * @param options
   * @returns {Promise.<T>}
   */
  create(order, items, unit, interval, active, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    const resSubscription = Subscription.build({
      original_order_id: order.id,
      customer_id: order.customer_id,
      email: order.email,
      line_items: items.map(item => {
        item =  _.omit(item.get({plain: true}), [
          'id',
          'requires_subscription',
          'subscription_unit',
          'subscription_interval',
          'fulfillment_id',
          'fulfillment_status',
          'order_id'
        ])
        return item
      }),
      unit: unit,
      interval: interval,
      active: active
    })

    return resSubscription.save({transaction: options.transaction || null})
      .then(() => {
        return Subscription.sequelize.Promise.mapSeries(items, item => {
          item.subscription_id = resSubscription.id
          return item.save({transaction: options.transaction || null})
        })
      })
      .then(() => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          }, {
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.subscribed',
          message: `Customer subscribed to subscription ${resSubscription.token}`,
          data: resSubscription
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSubscription
      })
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {*}
   */
  update(subscription, options){
    options = options || {}
    const Subscription =  this.app.orm.Subscription
    const update = _.omit(subscription,['id','created_at','updated_at'])
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription not found')
        }
        resSubscription = foundSubscription
        return resSubscription.update(update, {transaction: options.transaction || null})
      })
      .then(() => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          }, {
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.updated',
          message: `Customer subscription ${resSubscription.token} updated`,
          data: resSubscription
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSubscription
      })
  }

  /**
   *
   * @param body
   * @param subscription
   * @returns {*|Promise.<TResult>}
   */
  cancel(body, subscription, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    const Order = this.app.orm['Order']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription not found')
        }
        resSubscription = foundSubscription
        resSubscription.cancel_reason = body.reason || SUBSCRIPTION_CANCEL.OTHER
        resSubscription.cancelled_at = new Date()
        resSubscription.cancelled = true
        resSubscription.active = false
        return resSubscription.save({transaction: options.transaction || null})
      })
      .then(() => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          }, {
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.cancelled',
          message: `Customer subscription ${resSubscription.token} was cancelled`,
          data: resSubscription
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        if (body.cancel_pending) {
          return Order.findAll({
            where: {
              subscription_token: resSubscription.token,
              financial_status: ORDER_FINANCIAL.PENDING
            },
            transaction: options.transaction || null
          })
            .then(orders => {
              return Order.sequelize.Promise.mapSeries(orders, order => {
                return this.app.services.OrderService.cancel(
                  order,
                  {transaction: options.transaction || null}
                )
              })
            })
        }
        else {
          return
        }
      })
      .then(canceledOrders => {
        return resSubscription
      })
  }

  /**
   *
   * @param body
   * @param subscription
   * @param options
   * @returns {*|Promise.<TResult>}
   */
  activate(body, subscription, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        resSubscription.cancel_reason = null
        resSubscription.cancelled_at = null
        resSubscription.cancelled = false
        resSubscription.active = true
        return resSubscription.save({transaction: options.transaction || null})
      })
      .then(() => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          }, {
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.activated',
          message: `Customer subscription ${resSubscription.token} was activated`,
          data: resSubscription
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSubscription
      })
  }

  /**
   *
   * @param body
   * @param subscription
   * @param options
   * @returns {*|Promise.<TResult>}
   */
  deactivate(body, subscription, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, {transaction: options.transaction || null})
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        resSubscription.cancel_reason = null
        resSubscription.cancelled_at = null
        resSubscription.cancelled = false
        resSubscription.active = false
        return resSubscription.save({transaction: options.transaction || null})
      })
      .then(() => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          }, {
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.deactivated',
          message: `Customer subscription ${resSubscription.token} was deactivated`,
          data: resSubscription
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSubscription
      })
  }

  /**
   *
   * @param items
   * @param subscription
   * @returns {Promise.<TResult>}
   */
  addItems(items, subscription, options) {
    const Subscription = this.app.orm['Subscription']
    if (items.line_items) {
      items = items.line_items
    }
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }

        resSubscription = foundSubscription
        // const minimize = _.unionBy(items, 'product_id')
        return Subscription.sequelize.Promise.mapSeries(items, item => {
          return this.app.services.ProductService.resolveItem(item, {transaction: options.transaction || null})
        })
      })
      .then(resolvedItems => {
        return Subscription.sequelize.Promise.mapSeries(resolvedItems, (item, index) => {
          return resSubscription.addLine(
            item,
            items[index].quantity,
            items[index].properties,
            {transaction: options.transaction || null}
          )
        })
      })
      .then(resolvedItems => {
        return resSubscription.save({transaction: options.transaction || null})
      })
      .then(() => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          }, {
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.items_added',
          message: `Customer subscription ${resSubscription.token} had items added`,
          data: resSubscription
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSubscription
      })
  }

  /**
   *
   * @param items
   * @param subscription
   * @param options
   * @returns {Promise.<T>}
   */
  removeItems(items, subscription, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    if (items.line_items) {
      items = items.line_items
    }
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        return Subscription.sequelize.Promise.mapSeries(items, item => {
          return this.app.services.ProductService.resolveItem(item, {transaction: options.transaction || null})
        })
      })
      .then(resolvedItems => {
        return Subscription.sequelize.Promise.mapSeries(resolvedItems, (item, index) => {
          resSubscription.removeLine(item, items[index].quantity)
        })
      })
      .then(() => {
        return resSubscription.save({transaction: options.transaction || null})
      })
      .then(() => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          },{
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.items_removed',
          message: `Customer subscription ${resSubscription.token} had items removed`,
          data: resSubscription
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSubscription
      })
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<T>}
   */
  renew(subscription, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription, resOrder, renewal

    return this.app.orm.Cart.sequelize.transaction(t => {
      options.transaction = t
      return Subscription.resolve(subscription, {transaction: options.transaction || null})
        .then(foundSubscription => {
          if (!foundSubscription) {
            throw new Errors.FoundError(Error('Subscription Not Found'))
          }
          resSubscription = foundSubscription
          return this.prepareForOrder(resSubscription, {transaction: options.transaction || null})
        })
        .then(newOrder => {
          return this.app.services.OrderService.create(newOrder, {transaction: options.transaction || null})
        })
        .then(order => {
          if (!order) {
            throw new Error(`Unexpected error during subscription ${resSubscription.id} renewal`)
          }
          resOrder = order
          // Renew the Subscription
          if (resOrder.financial_status !== ORDER_FINANCIAL.PENDING) {
            renewal = 'success'
            return resSubscription.renew()
              .save({transaction: options.transaction || null})
          }
          else {
            renewal = 'failure'
            return resSubscription.retry()
              .save({transaction: options.transaction || null})
          }
        })
        .then(newSubscription => {
          // Tack Event
          const event = {
            object_id: resSubscription.customer_id,
            object: 'customer',
            objects: [{
              customer: resSubscription.customer_id
            }, {
              subscription: resSubscription.id
            }],
            type: `customer.subscription.renewed.${renewal}`,
            message: `Customer subscription ${resSubscription.token} renewal ${renewal}`,
            data: resSubscription
          }
          return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
        })
        .then(event => {
          return {
            subscription: resSubscription,
            order: resOrder
          }
        })
    })
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<T>}
   */
  retry(subscription, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    const Order = this.app.orm['Order']
    let resSubscription, resOrders, renewal
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        return Order.findAll({
          where: {
            subscription_token: resSubscription.token,
            financial_status: ORDER_FINANCIAL.PENDING
          },
          transaction: options.transaction || null
        })
      })
      .then(orders => {
        resOrders = orders
        if (resOrders.length == 0) {
          renewal = 'success'
          return resSubscription.renew()
            .save({transaction: options.transaction || null})
        }
        else {
          renewal = 'failure'
          return resSubscription.retry()
            .save({transaction: options.transaction || null})
        }
      })
      .then(() => {
        // Tack Event
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          }, {
            subscription: resSubscription.id
          }],
          type: `customer.subscription.renewed.${renewal}`,
          message: `Customer subscription ${resSubscription.token} renewal ${renewal}`,
          data: resSubscription
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSubscription
      })
    //return Promise.resolve(subscription)
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<T>}
   */
  prepareForOrder(subscription, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    const Customer = this.app.orm['Customer']

    let resSubscription, resCustomer

    return Subscription.resolve(subscription, {transaction: options.transaction || null})
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        return Customer.findById(resSubscription.customer_id, {
          attributes: ['id', 'email'],
          transaction: options.transaction || null
        })
      })
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Subscription Customer Not Found'))
        }
        resCustomer = customer
        return resCustomer.getDefaultSource({transaction: options.transaction || null})
          .then(source => {
            if (!source) {
              return {
                payment_kind: 'immediate' || this.app.config.proxyCart.orders.payment_kind,
                transaction_kind: 'sale' || this.app.config.proxyCart.orders.transaction_kind,
                payment_details: [],
                fulfillment_kind: 'immediate' || this.app.config.proxyCart.orders.fulfillment_kind
              }
            }
            else {
              return {
                transaction_kind: 'sale' || this.app.config.proxyCart.orders.transaction_kind,
                payment_kind: 'immediate' || this.app.config.proxyCart.orders.payment_kind,
                payment_details: [
                  {
                    gateway: source.gateway,
                    source: source,
                  }
                ],
                fulfillment_kind: 'immediate' || this.app.config.proxyCart.orders.fulfillment_kind
              }
            }
          })
      })
      .then(paymentDetails => {
        const newOrder = resSubscription.buildOrder({
          // Request info
          payment_details: paymentDetails.payment_details,
          transaction_kind: paymentDetails.transaction_kind || this.app.config.proxyCart.orders.transaction_kind,
          payment_kind: paymentDetails.payment_kind || this.app.config.proxyCart.orders.payment_kind,
          fulfillment_kind: paymentDetails.fulfillment_kind || this.app.config.proxyCart.orders.fulfillment_kind,
          processing_method: PAYMENT_PROCESSING_METHOD.SUBSCRIPTION,
          shipping_address: resCustomer.shipping_address,
          billing_address: resCustomer.billing_address,
          // Customer Info
          customer_id: resCustomer.id,
          email: resCustomer.email
        })
        return newOrder
      })
  }

  /**
   *
   * @returns {*|Promise.<TResult>}
   */
  renewThisHour() {
    const start = moment().startOf('hour')
    const end = start.clone().endOf('hour')
    const Subscription = this.app.orm['Subscription']
    const errors = []
    // let errorsTotal = 0
    let subscriptionsTotal = 0

    this.app.log.debug('SubscriptionService.renewThisHour', start.format('YYYY-MM-DD HH:mm:ss'), end.format('YYYY-MM-DD HH:mm:ss'))

    return Subscription.batch({
      where: {
        renews_on: {
          $gte: start.format('YYYY-MM-DD HH:mm:ss'),
          $lte: end.format('YYYY-MM-DD HH:mm:ss')
        },
        active: true,
        total_renewal_attempts: 0
      },
      regressive: true
    }, (subscriptions) => {

      const Sequelize = Subscription.sequelize
      return Sequelize.Promise.mapSeries(subscriptions, subscription => {
        return this.renew(subscription)
      })
        .then(results => {
          // Calculate Totals
          subscriptionsTotal = subscriptionsTotal + results.length
          return
        })
        .catch(err => {
          // errorsTotal++
          this.app.log.error(err)
          errors.push(err)
          return
        })
    })
      .then(subscriptions => {
        const results = {
          subscriptions: subscriptionsTotal,
          errors: errors
        }
        this.app.log.info(results)
        this.app.services.ProxyEngineService.publish('subscriptions.renew.complete', results)
        return results
      })
      .catch(err => {
        this.app.log.error(err)
        return
      })
  }

  /**
   *
   * @returns {Promise.<TResult>}
   */
  retryThisHour() {
    const Subscription = this.app.orm['Subscription']
    const start = moment().startOf('hour')
    const errors = []
    // let errorsTotal = 0
    let subscriptionsTotal = 0

    this.app.log.debug('SubscriptionService.retryThisHour', start.format('YYYY-MM-DD HH:mm:ss'))

    return Subscription.batch({
      where: {
        renew_retry_at: {
          $or: {
            $lte: start.format('YYYY-MM-DD HH:mm:ss'),
            $eq: null
          }
        },
        total_renewal_attempts: {
          $gt: 0,
          $lte: this.app.config.proxyCart.subscriptions.retry_attempts || 1
        },
        active: true
      },
      regressive: true
    }, (subscriptions) => {
      const Sequelize = Subscription.sequelize
      return Sequelize.Promise.mapSeries(subscriptions, subscription => {
        return this.retry(subscription)
      })
        .then(results => {
          // Calculate Totals
          subscriptionsTotal = subscriptionsTotal + results.length
          return
        })
        .catch(err => {
          // errorsTotal++
          this.app.log.error(err)
          errors.push(err)
          return
        })
    })
      .then(subscriptions => {
        const results = {
          subscriptions: subscriptionsTotal,
          errors: errors
        }
        this.app.log.info(results)
        this.app.services.ProxyEngineService.publish('subscriptions.retry.complete', results)
        return results
      })
      .catch(err => {
        this.app.log.error(err)
        return
      })
  }

  /**
   *
   * @returns {Promise.<TResult>}
   */
  cancelThisHour() {
    const Subscription = this.app.orm['Subscription']
    const errors = []
    // let errorsTotal = 0
    let subscriptionsTotal = 0

    this.app.log.debug('SubscriptionService.cancelThisHour')

    return Subscription.batch({
      where: {
        total_renewal_attempts: {
          $gte: this.app.config.proxyCart.subscriptions.retry_attempts || 1
        },
        cancelled: false
      },
      regressive: true
    }, (subscriptions) => {

      const Sequelize = Subscription.sequelize
      return Sequelize.Promise.mapSeries(subscriptions, subscription => {
        return this.cancel({
          reason: SUBSCRIPTION_CANCEL.FUNDING,
          cancel_pending: true
        }, subscription)
      })
        .then(results => {
          // Calculate Totals
          subscriptionsTotal = subscriptionsTotal + results.length
          return
        })
        .catch(err => {
          // errorsTotal++
          this.app.log.error(err)
          errors.push(err)
          return
        })
    })
      .then(subscriptions => {
        const results = {
          subscriptions: subscriptionsTotal,
          errors: errors
        }
        this.app.log.info(results)
        this.app.services.ProxyEngineService.publish('subscriptions.cancel.complete', results)
        return results
      })
      .catch(err => {
        this.app.log.error(err)
        return
      })
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<T>}
   */
  beforeCreate(subscription, options) {
    options = options || {}
    subscription.token = subscription.token || `subscription_${shortid.generate()}`

    return this.app.orm['Shop'].resolve(subscription.shop_id, {transaction: options.transaction || null })
      .then(shop => {
        // console.log('SubscriptionService.beforeCreate', shop)
        subscription.shop_id = shop.id
        return subscription.recalculate({transaction: options.transaction || null})
      })
      .catch(err => {
        // console.log('SubscriptionService.beforeCreate', err)
        return subscription.recalculate({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {*}
   */
  beforeUpdate(subscription, options) {
    options = options || {}
    return subscription.recalculate({transaction: options.transaction || null})
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<T>}
   */
  afterCreate(subscription, options) {
    options = options || {}
    this.app.services.ProxyEngineService.publish('subscription.created', subscription)
    return Promise.resolve(subscription)
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<T>}
   */
  afterUpdate(subscription, options) {
    options = options || {}
    this.app.services.ProxyEngineService.publish('subscription.updated', subscription)
    return Promise.resolve(subscription)
  }
}

