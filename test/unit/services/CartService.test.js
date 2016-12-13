'use strict'
/* global describe, it */
const assert = require('assert')

describe('CartService', () => {
  it('should exist', () => {
    assert(global.app.api.services['CartService'])
  })
})
