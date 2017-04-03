'use strict'
/* global describe, it */
const assert = require('assert')

describe('CustomerAccount Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['CustomerAccount'])
  })
})
