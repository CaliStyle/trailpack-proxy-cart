'use strict'
/* global describe, it */
const assert = require('assert')

describe('Fulfillment Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Fulfillment'])
  })
})
