'use strict'
/* global describe, it */
const assert = require('assert')

describe('CustomerOrder Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['CustomerOrder'])
  })
})
