'use strict'
/* global describe, it */

const assert = require('assert')

describe('CustomerPolicy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['CustomerPolicy'])
    assert(global.app.policies['CustomerPolicy'])
  })
})
