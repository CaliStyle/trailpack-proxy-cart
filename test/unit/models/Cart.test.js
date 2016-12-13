'use strict'
/* global describe, it */
const assert = require('assert')

describe('Cart Model', () => {
  it('should exist', () => {
    assert(global.app.api.models['Cart'])
  })
})
