'use strict'
/* global describe, it */
const assert = require('assert')

describe('Source Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Source'])
  })
})
