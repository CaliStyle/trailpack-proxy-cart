'use strict'
/* global describe, it */
const assert = require('assert')

describe('TransactionService', () => {
  it('should exist', () => {
    assert(global.app.api.services['TransactionService'])
  })
})
