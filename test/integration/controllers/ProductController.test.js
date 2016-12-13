'use strict'
/* global describe, it */
const assert = require('assert')

describe('ProductController', () => {
  it('should exist', () => {
    assert(global.app.api.controllers['ProductController'])
  })
})
