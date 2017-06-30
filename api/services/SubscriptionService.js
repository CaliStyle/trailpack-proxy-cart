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
  /**
   *
   * @param order
   * @param active
   * @returns {Promise.<TResult>}
   */
  setupSubscriptions(order, active, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, options)
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order nto found')
        }
        resOrder = foundOrder
        return resOrder.getOrder_items()
      })
      .then(orderItems => {
        orderItems = _.filter(orderItems, 'requires_subscription')

        const groups = []
        const units = _.groupBy(orderItems, 'subscription_unit')

        _.forEach(units, function(value, unit) {
          // console.log(key, value)
          const intervals = _.groupBy(units[unit], 'subscription_interval')
          _.forEach(intervals, (items, interval) => {
            groups.push({
              unit: unit,
              interval: interval,
              items: items
            })
          })
        })
        // console.log('the groups',groups)
        return Promise.all(groups.map((group) => {
          // console.log('this group',group)
          return this.create(resOrder, group.items, group.unit, group.interval, active)
        }))
      })
  }

  /**
   *
   * @param order
   * @param items
   * @param unit
   * @param interval
   * @param active
   * @returns {Promise.<TResult>}
   */
  create(order, items, unit, interval, active) {
    const Subscription = this.app.orm['Subscription']
    const create = {
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
    }
    // console.log('this subscription', create)
    let resSubscription
    return Subscription.create(create)
      .then(subscription => {
        resSubscription = subscription
        return Promise.all(items.map(item => {
          item.subscription_id = resSubscription.id
          return item.save()
        }))
      })
      .then(orderItems => {
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
    const Subscription =  this.app.orm.Subscription
    const update = _.omit(subscription,['id','created_at','updated_at'])
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription not found')
        }
        resSubscription = foundSubscription
        return resSubscription.update(update)
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
        return resSubscription.save()
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
              return Promise.all(orders.map(order => {
                return this.app.services.OrderService.cancel(order, {transaction: options.transaction || null})
              }))
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
   * @returns {*|Promise.<TResult>}
   */
  activate(body, subscription, options) {
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
        return resSubscription.save()
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
   * @returns {*|Promise.<TResult>}
   */
  deactivate(body, subscription, options) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        resSubscription.cancel_reason = null
        resSubscription.cancelled_at = null
        resSubscription.cancelled = false
        resSubscription.active = false
        return resSubscription.save()
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
        return Promise.all(items.map(item => {
          return this.app.services.ProductService.resolveItem(item)
        }))
      })
      .then(resolvedItems => {
        return Promise.all(resolvedItems.map((item, index) => {
          return resSubscription.addLine(item, items[index].quantity, items[index].properties)
        }))
      })
      .then(resolvedItems => {
        return resSubscription.save()
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
   * @returns {Promise.<TResult>}
   */
  removeItems(items, subscription, options) {
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
        return Promise.all(items.map(item => {
          return this.app.services.ProductService.resolveItem(item)
        }))
      })
      .then(resolvedItems => {
        return Promise.all(resolvedItems.map((item, index) => {
          resSubscription.removeLine(item, items[index].quantity)
        }))
      })
      .then(resolvedItems => {
        return resSubscription.save()
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
   * @returns {Promise.<TResult>}
   */
  renew(subscription, options) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription, resOrder, renewal
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        return this.prepareForOrder(resSubscription)
      })
      .then(newOrder => {
        return this.app.services.OrderService.create(newOrder)
      })
      .then(order => {
        if (!order) {
          throw new Error(`Unexpected error during subscription ${resSubscription.id} renewal`)
        }
        resOrder = order
        // console.log('THIS RENEWED', order)
        // Renew the Subscription
        if (resOrder.financial_status !== ORDER_FINANCIAL.PENDING) {
          renewal = 'success'
          return resSubscription.renew().save()
        }
        else {
          renewal = 'failure'
          return resSubscription.retry().save()
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
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<TResult>}
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
          return resSubscription.renew().save()
        }
        else {
          renewal = 'failure'
          return resSubscription.retry().save()
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
   * @returns {Promise.<TResult>}
   */
  prepareForOrder(subscription, options) {
    options = options || {}
    const Subscription = this.app.orm['Subscription']
    const Customer = this.app.orm['Customer']

    let resSubscription, resCustomer

    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        return Customer.findById(resSubscription.customer_id, {
          attributes: ['id', 'email']
        })
      })
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Subscription Customer Not Found'))
        }
        resCustomer = customer
        return this.app.services.AccountService.getDefaultSource(resCustomer)
          .then(source => {
            if (!source) {
              return {
                payment_kind: 'sale' || this.app.config.proxyCart.order_payment_kind,
                payment_details: [],
                fulfillment_kind: 'immediate' || this.app.config.proxyCart.order_fulfillment_kind
              }
            }
            return {
              payment_kind: 'sale' || this.app.config.proxyCart.order_payment_kind,
              payment_details: [
                {
                  gateway: source.gateway,
                  source: source,
                }
              ],
              fulfillment_kind: 'immediate' || this.app.config.proxyCart.order_fulfillment_kind
            }
          })
      })
      .then(paymentDetails => {
        const newOrder = resSubscription.buildOrder({
          // Request info
          payment_details: paymentDetails.payment_details,
          payment_kind: paymentDetails.payment_kind || this.app.config.proxyCart.order_payment_kind,
          fulfillment_kind: paymentDetails.fulfillment_kind || this.app.config.proxyCart.order_fulfillment_kind,
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
        active: true
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
   * @returns {Promise.<TResult>}
   */
  beforeCreate(subscription, options) {
    if (!options) {
      options = {}
    }
    // If not token was already created, create it
    if (!subscription.token) {
      subscription.token = `subscription_${shortid.generate()}`
    }
    return this.app.services.ShopService.resolve(subscription.shop_id, options)
      .then(shop => {
        // console.log('SubscriptionService.beforeCreate', shop)
        subscription.shop_id = shop.id
        return subscription.recalculate()
      })
      .catch(err => {
        // console.log('SubscriptionService.beforeCreate', err)
        return subscription.recalculate()
      })
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {*}
   */
  beforeUpdate(subscription, options) {
    if (!options) {
      options = {}
    }
    return subscription.recalculate()
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<T>}
   */
  afterCreate(subscription, options) {
    if (!options) {
      options = {}
    }
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
    if (!options) {
      options = {}
    }
    this.app.services.ProxyEngineService.publish('subscription.updated', subscription)
    return Promise.resolve(subscription)
  }
}

