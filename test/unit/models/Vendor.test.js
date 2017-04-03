'use strict'
/* global describe, it */
const assert = require('assert')

describe('Vendor Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Vendor'])
  })
})
