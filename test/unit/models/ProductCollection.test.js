'use strict'
/* global describe, it */
const assert = require('assert')

describe('ProductCollection Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['ProductCollection'])
  })
})
