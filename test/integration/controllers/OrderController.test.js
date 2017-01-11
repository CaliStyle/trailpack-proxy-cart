'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('OrderController', () => {
  let request
  before(() => {
    request = supertest('http://localhost:3000')
  })
  it('should exist', () => {
    assert(global.app.api.controllers['OrderController'])
  })
  it('should count all orders', (done) => {
    request
      .get('/order/count')
      .expect(200)
      .end((err, res) => {
        // console.log('ORDERS COUNT', res.body)
        assert.ok(res.body.orders)
        done(err)
      })
  })
})
