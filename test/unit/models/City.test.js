'use strict'
/* global describe, it */
const assert = require('assert')

describe('City Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['City'])
  })
})
