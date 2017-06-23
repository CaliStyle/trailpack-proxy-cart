'use strict'
/* global describe, it */
const assert = require('assert')

describe('SubscriptionService', () => {
  let SubscriptionService
  it('should exist', () => {
    assert(global.app.api.services['SubscriptionService'])
    SubscriptionService = global.app.services['SubscriptionService']
  })
  it('should renew subscriptions due this hour', (done) => {
    SubscriptionService.renewThisHour()
      .then(renewals => {
        // console.log('RENEWALS', renewals)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
