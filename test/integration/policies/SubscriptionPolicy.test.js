'use strict'
/* global describe, it */

const assert = require('assert')

describe('Subscription Policy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['SubscriptionPolicy'])
    assert(global.app.policies['SubscriptionPolicy'])
  })
})
