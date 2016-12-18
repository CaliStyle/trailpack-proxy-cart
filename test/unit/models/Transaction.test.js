'use strict'
/* global describe, it */
const assert = require('assert')

describe('Transaction Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Transaction'])
  })
})
