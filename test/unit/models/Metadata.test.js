'use strict'
/* global describe, it */
const assert = require('assert')

describe('Metadata Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Metadata'])
  })
})
