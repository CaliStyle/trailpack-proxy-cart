'use strict'
/* global describe, it */
const assert = require('assert')

describe('PaymentService', () => {
  it('should exist', () => {
    assert(global.app.api.services['PaymentService'])
  })
})
