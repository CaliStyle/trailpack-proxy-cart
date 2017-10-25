'use strict'
/* global describe, it */
const assert = require('assert')

describe('Transaction Model', () => {
  let Transaction
  it('should exist', () => {
    assert(global.app.api.models['Transaction'])
    Transaction = global.app.services.ProxyEngineService.getModel('Transaction')
  })
  it('should resolve a transaction instance', (done) => {
    Transaction.resolve(Transaction.build({}))
      .then(transaction => {
        assert.ok(transaction instanceof Transaction)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
