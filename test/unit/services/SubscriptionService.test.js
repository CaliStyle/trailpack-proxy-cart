'use strict'
/* global describe, it */
const assert = require('assert')
const moment = require('moment')

describe('SubscriptionService', () => {
  let SubscriptionService, Subscription, Order
  it('should exist', () => {
    assert(global.app.api.services['SubscriptionService'])
    SubscriptionService = global.app.services['SubscriptionService']
    Subscription = global.app.orm['Subscription']
    Order = global.app.orm['Order']
  })
  it('should renew subscriptions due this hour', (done) => {
    const start = moment().startOf('hour')
    const subscriptionsToCreate = []
    let i = 0
    while (i < 21) {
      subscriptionsToCreate.push({
        customer_id: 1,
        shop_id: 1,
        token: `subscription_${i}`,
        renews_on: start,
        interval: 1,
        active: true,
        interval_unit: 'd'
      })
      i++
    }
    Subscription.bulkCreate(subscriptionsToCreate)
      .then(subscriptions => {
        return SubscriptionService.renewThisHour()
          .then(renewals => {
            assert.equal(renewals.subscriptions, 21)
            assert.equal(renewals.errors.length, 0)
            return SubscriptionService.renewThisHour()
          })
      })
      .then(renewals => {
        // Should be zero because they should have all renewed.
        assert.equal(renewals.subscriptions, 0)
        assert.equal(renewals.errors.length, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should retry subscriptions that failed payment', (done) => {
    const start = moment().startOf('hour').subtract(1,'hours')
    const subscriptionsToCreate = []
    let i = 0
    while (i < 21) {
      subscriptionsToCreate.push({
        customer_id: 1,
        shop_id: 1,
        token: `subscription_retry_${i}`,
        renews_on: start,
        renew_retry_at: start,
        interval: 1,
        interval_unit: 'd',
        active: true,
        total_renewal_attempts: 1
      })
      i++
    }

    Subscription.bulkCreate(subscriptionsToCreate)
      .then(subscriptions => {
        return Promise.all(subscriptions.map(subscription => {
          return Order.create({
            shop_id: subscription.shop_id,
            subscription_token: subscription.token,
            financial_status: 'pending'
          })
        }))
      })
      .then(orders => {
        return SubscriptionService.retryThisHour()
          .then(renewals => {
            assert.equal(renewals.subscriptions, 21)
            assert.equal(renewals.errors.length, 0)
            return SubscriptionService.retryThisHour()
          })
      })
      .then(renewals => {
        // Should be zero since they can't be retried more than once in the same hour.
        assert.equal(renewals.subscriptions, 0)
        assert.equal(renewals.errors.length, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should cancel subscriptions that failed all attempts', (done) => {
    const start = moment().startOf('hour').subtract(5, 'days')
    const subscriptionsToCreate = []
    let i = 0
    while (i < 21) {
      subscriptionsToCreate.push({
        customer_id: 1,
        shop_id: 1,
        token: `subscription_cancel_${i}`,
        renews_on: start,
        renew_retry_at: start,
        interval: 1,
        interval_unit: 'd',
        active: true,
        total_renewal_attempts: 5
      })
      i++
    }

    Subscription.bulkCreate(subscriptionsToCreate)
      .then(subscriptions => {
        return Promise.all(subscriptions.map(subscription => {
          return Order.create({
            shop_id: subscription.shop_id,
            subscription_token: subscription.token,
            financial_status: 'pending'
          })
        }))
      })
      .then(orders => {
        // console.log('RENEW THESE',order)
        return SubscriptionService.cancelThisHour()
          .then(renewals => {
            assert.equal(renewals.subscriptions, 21)
            assert.equal(renewals.errors.length, 0)
            return SubscriptionService.cancelThisHour()
          })
      })
      .then(renewals => {
        // Should be zero since all eligible subscriptions should be cancelled.
        assert.equal(renewals.subscriptions, 0)
        assert.equal(renewals.errors.length, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
