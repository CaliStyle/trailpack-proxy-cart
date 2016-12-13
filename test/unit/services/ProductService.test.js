'use strict'
/* global describe, it */
const assert = require('assert')

describe('ProductService', () => {
  it('should exist', () => {
    assert(global.app.api.services['ProductService'])
  })
})
