'use strict'
/* global describe, it */
const assert = require('assert')

describe('CustomerSource Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['CustomerSource'])
  })
})
