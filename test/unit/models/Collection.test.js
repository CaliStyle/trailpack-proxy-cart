'use strict'
/* global describe, it */
const assert = require('assert')

describe('Collection Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Collection'])
  })
})
