'use strict'
/* global describe, it */
const assert = require('assert')

describe('OrderItem Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['OrderItem'])
  })
})
