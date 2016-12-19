'use strict'
/* global describe, it */
const assert = require('assert')

describe('TaxService', () => {
  it('should exist', () => {
    assert(global.app.api.services['TaxService'])
  })
})
