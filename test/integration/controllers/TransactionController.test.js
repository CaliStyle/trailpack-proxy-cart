'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
// const _ = require('lodash')

describe('TransactionController', () => {
  let request

  before(() => {
    request = supertest('http://localhost:3000')
  })
  it('should exist', () => {
    assert(global.app.api.controllers['TransactionController'])
  })
  it.skip('should create a transaction',() => {

  })
  it.skip('should update a transaction',() => {

  })
  it.skip('should retry a transaction',() => {

  })
  it.skip('should destroy a transaction',() => {

  })

})
