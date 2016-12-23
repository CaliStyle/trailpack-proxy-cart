'use strict'
/* global describe, it */
const assert = require('assert')

describe('CustomerController', () => {
  it('should exist', () => {
    assert(global.app.api.controllers['CustomerController'])
  })
})
