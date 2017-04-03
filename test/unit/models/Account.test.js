'use strict'
/* global describe, it */
const assert = require('assert')

describe('Account Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Account'])
  })
})
