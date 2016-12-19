'use strict'
/* global describe, it */
const assert = require('assert')

describe('DiscountService', () => {
  it('should exist', () => {
    assert(global.app.api.services['DiscountService'])
  })
})
