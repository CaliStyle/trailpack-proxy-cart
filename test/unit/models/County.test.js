'use strict'
/* global describe, it */
const assert = require('assert')

describe('County Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['County'])
  })
})
