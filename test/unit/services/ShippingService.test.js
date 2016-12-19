'use strict'
/* global describe, it */
const assert = require('assert')

describe('ShippingService', () => {
  it('should exist', () => {
    assert(global.app.api.services['ShippingService'])
  })
})
