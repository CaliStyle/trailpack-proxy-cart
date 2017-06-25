/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const shortid = require('shortid')
const moment = require('moment')
const Errors = require('proxy-engine-errors')
const SUBSCRIPTION_CANCEL = require('../utils/enums').SUBSCRIPTION_CANCEL
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD

/**
 * @module SubscriptionService
 * @description Subscription Service
 */
module.exports = class SubscriptionService extends Service {
  /**
   *
   * @param subscription
   * @param options
   * @returns {*}
   */
  resolve(subscription, options){
    // console.log('TYPEOF subscription',typeof subscription)
    const Subscription =  this.app.orm['Subscription']

    if (subscription instanceof Subscription.Instance){
      return Promise.resolve(subscription, options)
    }
    else if (subscription && _.isObject(subscription) && subscription.id) {
      return Subscription.findById(subscription.id, options)
        .then(resSubscription => {
          if (!resSubscription) {
            throw new Errors.FoundError(Error(`Subscription ${subscription.id} not found`))
          }
          return resSubscription
        })
    }
    else if (subscription && _.isObject(subscription) && subscription.token) {
      return Subscription.findOne({
        where: {
          token: subscription.token
        }
      }, options)
        .then(resSubscription => {
          if (!resSubscription) {
            throw new Errors.FoundError(Error(`Subscription ${subscription.token} not found`))
          }
          return resSubscription
        })
    }
    else if (subscription && (_.isString(subscription) || _.isNumber(subscription))) {
      return Subscription.findById(subscription, options)
        .then(resSubscription => {
          if (!resSubscription) {
            throw new Errors.FoundError(Error(`Subscription ${subscription} not found`))
          }
          return resSubscription
        })
    }
    else {
      // TODO create proper error
      const err = new Error(`Unable to resolve Subscription ${subscription}`)
      return Promise.reject(err)
    }
  }

  /**
   *
   * @param order
   * @param active
   * @returns {Promise.<TResult>}
   */
  setupSubscriptions(order, active) {
    const Order = this.app.orm['Order']
    return Order.resolve(order)
      .then(order => {
        if (!order.order_items || order.order_items.length == 0) {
          return order.getOrder_items()
        }
        return order
      })
      .then(order => {
        order.order_items = _.filter(order.order_items, 'requires_subscription')

        const groups = []
        const units = _.groupBy(order.order_items, 'subscription_unit')

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
          return this.create(order, group.items, group.unit, group.interval, active)
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
          },{
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.subscribed',
          message: `Customer subscribed to subscription ${resSubscription.token}`,
          data: resSubscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
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
    if (!subscription.id) {
      const err = new Errors.FoundError(Error('Subscription is missing id'))
      return Promise.reject(err)
    }
    const Subscription =  this.app.orm.Subscription
    const update = _.omit(subscription,['id','created_at','updated_at'])
    return Subscription.findById(subscription.id)
      .then(resSubscription => {
        return resSubscription.update(update, options)
      })
      .then(subscription => {
        const event = {
          object_id: subscription.customer_id,
          object: 'customer',
          objects: [{
            customer: subscription.customer_id
          },{
            subscription: subscription.id
          }],
          type: 'customer.subscription.updated',
          message: `Customer subscription ${subscription.token} updated`,
          data: subscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
        return subscription
      })
  }

  /**
   *
   * @param body
   * @param subscription
   * @returns {*|Promise.<TResult>}
   */
  cancel(body, subscription) {
    const Subscription = this.app.orm['Subscription']
    return Subscription.resolve(subscription)
      .then(resSubscription => {
        resSubscription.cancel_reason = body.reason || SUBSCRIPTION_CANCEL.OTHER
        resSubscription.cancelled_at = new Date()
        resSubscription.cancelled = true
        resSubscription.active = false
        return resSubscription.save()
      })
      .then(resSubscription => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          },{
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.cancelled',
          message: `Customer subscription ${resSubscription.token} was cancelled`,
          data: resSubscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})

        return resSubscription
      })
  }

  /**
   *
   * @param body
   * @param subscription
   * @returns {*|Promise.<TResult>}
   */
  activate(body, subscription) {
    const Subscription = this.app.orm['Subscription']
    return Subscription.resolve(subscription)
      .then(resSubscription => {
        resSubscription.cancel_reason = null
        resSubscription.cancelled_at = null
        resSubscription.cancelled = false
        resSubscription.active = true
        return resSubscription.save()
      })
      .then(resSubscription => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          },{
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.activated',
          message: `Customer subscription ${resSubscription.token} was activated`,
          data: resSubscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
        return resSubscription
      })
  }

  /**
   *
   * @param body
   * @param subscription
   * @returns {*|Promise.<TResult>}
   */
  deactivate(body, subscription) {
    const Subscription = this.app.orm['Subscription']
    return Subscription.resolve(subscription)
      .then(resSubscription => {
        resSubscription.cancel_reason = null
        resSubscription.cancelled_at = null
        resSubscription.cancelled = false
        resSubscription.active = false
        return resSubscription.save()
      })
      .then(resSubscription => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          },{
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.deactivated',
          message: `Customer subscription ${resSubscription.token} was deactivated`,
          data: resSubscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
        return resSubscription
      })
  }

  addItems(items, subscription) {
    const Subscription = this.app.orm['Subscription']
    if (items.line_items) {
      items = items.line_items
    }
    let resSubscription
    return Subscription.resolve(subscription)
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
        // console.log('SubscriptionService.addItemsToSubscription', subscription)
        return resSubscription.save()
      })
      .then(subscription => {
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          },{
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.items_added',
          message: `Customer subscription ${resSubscription.token} had items added`,
          data: subscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})

        return subscription
      })
  }
  removeItems(items, subscription) {
    const Subscription = this.app.orm['Subscription']
    if (items.line_items) {
      items = items.line_items
    }
    let resSubscription
    return Subscription.resolve(subscription)
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
      .then(subscription => {
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
          data: subscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})

        return subscription
      })
  }

  renew(subscription) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription, resOrder
    return Subscription.resolve(subscription)
      .then(subscription => {
        if (!subscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = subscription
        return resSubscription
      })
      .then(subscription => {
        return this.prepareForOrder(subscription)
      })
      .then(newOrder => {
        return this.app.services.OrderService.create(newOrder)
      })
      .then(order => {
        if (!order) {
          throw new Error('Unexpected error during checkout')
        }
        resOrder = order
        // Renew the Subscription
        resSubscription.renew()
        return resSubscription.save()
      })
      .then(newSubscription => {
        // Tack Event
        const event = {
          object_id: resSubscription.customer_id,
          object: 'customer',
          objects: [{
            customer: resSubscription.customer_id
          },{
            subscription: resSubscription.id
          }],
          type: 'customer.subscription.renewed',
          message: `Customer subscription ${resSubscription.token} was renewed`,
          data: resSubscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})

        return {
          subscription: resSubscription,
          order: resOrder
        }
      })
  }

  prepareForOrder(subscription) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription, resCustomer

    return Subscription.resolve(subscription)
      .then(subscription => {
        resSubscription = subscription
        return this.app.orm['Customer'].findById(resSubscription.customer_id, {
          attributes: ['id', 'email']
        })
      })
      .then(customer => {
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

        const newOrder = {
          // Request info
          payment_details: paymentDetails.payment_details,
          payment_kind: paymentDetails.payment_kind || this.app.config.proxyCart.order_payment_kind,
          fulfillment_kind: paymentDetails.fulfillment_kind || this.app.config.proxyCart.order_fulfillment_kind,
          processing_method: PAYMENT_PROCESSING_METHOD.SUBSCRIPTION,
          shipping_address: resCustomer.shipping_address,
          billing_address: resCustomer.billing_address,

          // Customer Info
          customer_id: resCustomer.id,
          email: resCustomer.email,

          // Subscription Info
          subscription_token: resSubscription.token,
          currency: resSubscription.currency,
          line_items: resSubscription.line_items,
          tax_lines: resSubscription.tax_lines,
          shipping_lines: resSubscription.shipping_lines,
          discounted_lines: resSubscription.discounted_lines,
          coupon_lines: resSubscription.coupon_lines,
          subtotal_price: resSubscription.subtotal_price,
          taxes_included: resSubscription.taxes_included,
          total_discounts: resSubscription.total_discounts,
          total_coupons: resSubscription.total_coupons,
          total_line_items_price: resSubscription.total_line_items_price,
          total_price: resSubscription.total_due,
          total_due: resSubscription.total_due,
          total_tax: resSubscription.total_tax,
          total_weight: resSubscription.total_weight,
          total_items: resSubscription.total_items,
          shop_id: resSubscription.shop_id,
          has_shipping: resSubscription.has_shipping,
          has_subscription: false
        }
        // console.log('cart checkout prepare', newOrder)
        return newOrder
      })
  }

  /**
   *
   * @returns {*|Promise.<TResult>}
   */
  renewThisHour() {
    this.app.log.debug('SubscriptionService.renewThisHour')
    const start = moment().startOf('hour')
    const end = start.clone().endOf('hour')
    const Subscription = this.app.orm['Subscription']
    const errors = []
    // let errorsTotal = 0
    let subscriptionsTotal = 0

    return Subscription.batch({
      where: {
        renews_on: {
          $gte: start.format('YYYY-MM-DD HH:mm:ss'),
          $lte: end.format('YYYY-MM-DD HH:mm:ss')
        },
        active: true
      }
    }, subscriptions => {
      return Promise.all(subscriptions.map(subscription => {
        return this.renew(subscription)
      }))
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
        this.app.services.ProxyEngineService.publish('subscription.renew.complete', results)
        return results
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

