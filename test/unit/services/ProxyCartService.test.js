'use strict'
/* global describe, it */
const assert = require('assert')

describe('ProxyCartService', () => {
  it('should exist', () => {
    assert(global.app.api.services['ProxyCartService'])
  })
})
