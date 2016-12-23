'use strict'
/* global describe, it */
const assert = require('assert')

describe('Shop Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Shop'])
  })
})
