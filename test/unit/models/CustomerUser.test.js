'use strict'
/* global describe, it */
const assert = require('assert')

describe('CustomerUser Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['CustomerUser'])
  })
})
