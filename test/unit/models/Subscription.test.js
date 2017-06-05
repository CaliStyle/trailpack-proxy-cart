'use strict'
/* global describe, it */
const assert = require('assert')

describe('Subscription Model', () => {
  let Subscription
  it('should exist', () => {
    assert(global.app.api.services['SubscriptionService'])
    Subscription = global.app.services.ProxyEngineService.getModel('Subscription')
    assert(Subscription)
  })
  it('should resolve a subscription instance', (done) => {
    Subscription.resolve(Subscription.build({}))
      .then(subscription => {
        assert.ok(subscription instanceof Subscription.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
