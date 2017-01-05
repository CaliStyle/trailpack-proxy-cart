'use strict'
/* global describe, it */
const assert = require('assert')

describe('Quote Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Quote'])
  })
})
