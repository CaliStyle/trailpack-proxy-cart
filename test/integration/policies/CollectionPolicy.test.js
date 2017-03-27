'use strict'
/* global describe, it */

const assert = require('assert')

describe('Collection Policy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['CollectionPolicy'])
    assert(global.app.policies['CollectionPolicy'])
  })
})
