'use strict'
/* global describe, it */
const assert = require('assert')

describe('Tag Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Tag'])
  })
})
