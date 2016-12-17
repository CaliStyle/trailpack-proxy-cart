'use strict'
/* global describe, it */
const assert = require('assert')

describe('OrderService', () => {
  it('should exist', () => {
    assert(global.app.api.services['OrderService'])
  })
})
