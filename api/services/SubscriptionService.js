/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const shortid = require('shortid')
const Errors = require('proxy-engine-errors')
const SUBSCRIPTION_CANCEL = require('../utils/enums').SUBSCRIPTION_CANCEL
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
    return this.app.services.OrderService.resolve(order)
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
  create(order, items, unit, interval, active) {
    const Subscription = this.app.orm['Subscription']
    const create = {
      original_order_id: order.id,
      customer_id: order.customer_id,
      line_items: items.map(item => {
        item =  _.omit(item.get({plain: true}), [
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
        return resSubscription
      })
  }
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
  }

  /**
   *
   * @param body
   * @param subscription
   * @returns {*|Promise.<TResult>}
   */
  cancel(body, subscription) {
    return this.resolve(subscription)
      .then(resSubscription => {
        resSubscription.cancel_reason = body.reason || SUBSCRIPTION_CANCEL.OTHER
        resSubscription.cancelled_at = new Date()
        resSubscription.active = false
        return resSubscription.save()
      })
  }

  /**
   *
   * @param body
   * @param subscription
   * @returns {*|Promise.<TResult>}
   */
  activate(body, subscription) {
    return this.resolve(subscription)
      .then(resSubscription => {
        resSubscription.cancel_reason = null
        resSubscription.cancelled_at = null
        resSubscription.active = true
        return resSubscription.save()
      })
  }

  /**
   *
   * @param item
   * @returns {*}
   */
  resolveItem(item){
    // const FootprintService = this.app.services.FootprintService
    const Product = this.app.orm.Product
    const ProductVariant = this.app.orm.ProductVariant
    const Image = this.app.orm.ProductImage

    if (item.id || item.variant_id || item.product_variant_id) {
      const id = item.id || item.variant_id || item.product_variant_id
      return ProductVariant.findById(id, {
        include: [
          {
            model: Product,
            include: [
              {
                model: Image,
                as: 'images',
                attributes: ['src','full','thumbnail','small','medium','large','alt','position']
              }
            ]
          },
          {
            model: Image,
            as: 'images',
            attributes: ['src','full','thumbnail','small','medium','large','alt','position']
          }
        ]
      })
    }
    else if (item.product_id) {
      return ProductVariant.find({
        where: {
          product_id: item.product_id,
          position: 1
        },
        include: [
          {
            model: Product,
            include: [
              {
                model: Image,
                as: 'images',
                attributes: ['src','full','thumbnail','small','medium','large','alt','position']
              }
            ]
          },
          {
            model: Image,
            as: 'images',
            attributes: ['src','full','thumbnail','small','medium','large','alt','position']
          }
        ]
      })
    }
    else {
      const err = new Errors.FoundError(Error(`${item} not found`))
      return Promise.reject(err)
    }
  }

  addItems(items, subscription) {
    if (items.line_items) {
      items = items.line_items
    }
    let resSubscription
    return this.resolve(subscription)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }

        resSubscription = foundSubscription
        // const minimize = _.unionBy(items, 'product_id')
        return Promise.all(items.map(item => {
          return this.resolveItem(item)
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
  }
  removeItems(items, subscription) {
    if (items.line_items) {
      items = items.line_items
    }
    let resSubscription
    return this.resolve(subscription)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }

        resSubscription = foundSubscription
        return Promise.all(items.map(item => {
          return this.resolveItem(item)
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
  }

  renew(subscription) {
    let resSubscription
    return this.resolve(subscription)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Errors.FoundError(Error('Subscription Not Found'))
        }
        resSubscription = foundSubscription
        return resSubscription
      })
  }

  prepareForOrder(req) {
    return Promise.resolve({})
  }

  beforeCreate(subscription) {
    // If not token was already created, create it
    if (!subscription.token) {
      subscription.token = `subscription_${shortid.generate()}`
    }
    return subscription.recalculate()
  }
  beforeUpdate(subscription) {
    return subscription.recalculate()
  }
}

