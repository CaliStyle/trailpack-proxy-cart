'use strict'
/* global describe, it */

const assert = require('assert')

describe('ProductPolicy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['ProductPolicy'])
    assert(global.app.policies['ProductPolicy'])
  })
})
