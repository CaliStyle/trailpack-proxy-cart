'use strict'
/* global describe, it */

const assert = require('assert')

describe('CartPolicy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['CartPolicy'])
    assert(global.app.policies['CartPolicy'])
  })
})
