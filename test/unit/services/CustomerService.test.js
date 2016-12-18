'use strict'
/* global describe, it */
const assert = require('assert')

describe('CustomerService', () => {
  it('should exist', () => {
    assert(global.app.api.services['CustomerService'])
  })
})
