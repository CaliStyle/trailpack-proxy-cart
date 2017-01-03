'use strict'
/* global describe, it */

const assert = require('assert')

describe('CustomerPolicy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['CustomerPolicy'])
  })
})
