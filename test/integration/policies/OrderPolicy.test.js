'use strict'
/* global describe, it */

const assert = require('assert')

describe('OrderPolicy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['OrderPolicy'])
    assert(global.app.policies['OrderPolicy'])
  })
})
