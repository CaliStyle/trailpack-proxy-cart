'use strict'
/* global describe, it */
const assert = require('assert')

describe('CustomerService', () => {
  let CustomerService
  let Customer
  it('should exist', () => {
    assert(global.app.api.services['CustomerService'])

    CustomerService = global.app.services['CustomerService']
    Customer = global.app.orm['Customer']
  })
  it('should resolve a customer instance', (done) => {
    Customer.resolve(Customer.build({}))
      .then(customer => {
        assert.ok(customer instanceof Customer.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
