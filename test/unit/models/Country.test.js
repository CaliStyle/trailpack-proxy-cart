'use strict'
/* global describe, it */
const assert = require('assert')

describe('Country Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Country'])
  })
})
