'use strict'
/* global describe, it */

const assert = require('assert')

describe('ProxyCartPolicy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['ProxyCartPolicy'])
    assert(global.app.policies['ProxyCartPolicy'])
  })
})
