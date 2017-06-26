'use strict'
/* global describe, it */
const assert = require('assert')
const moment = require('moment')

describe('SubscriptionService', () => {
  let SubscriptionService, Subscription
  it('should exist', () => {
    assert(global.app.api.services['SubscriptionService'])
    SubscriptionService = global.app.services['SubscriptionService']
    Subscription = global.app.orm['Subscription']
  })
  it('should renew subscriptions due this hour', (done) => {
    const start = moment().startOf('hour')
    const subscriptionsToCreate = []
    let i = 0
    while (i < 21) {
      subscriptionsToCreate.push({
        customer_id: 1,
        token: `subscription_${i}`,
        renews_on: start,
        interval: 1,
        interval_unit: 'd'
      })
      i++
    }
    Subscription.bulkCreate(subscriptionsToCreate)
      .then(subscriptions => {
        // console.log('RENEW THESE',subscriptions)
        return SubscriptionService.renewThisHour()
      })
      .then(renewals => {
        // console.log('THIS RENEWALS', renewals)
        assert.equal(renewals.subscriptions, 21)
        assert.equal(renewals.errors.length, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
