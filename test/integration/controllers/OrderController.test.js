'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('OrderController', () => {
  let request
  let orderID
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
        assert.ok(_.isNumber(res.body.orders))
        done(err)
      })
  })
  it.skip('should create an order', (done) => {
    request
      .post('/order')
      .send({

      })
      .expect(200)
      .end((err, res) => {
        // console.log('ORDERS COUNT', res.body)
        done(err)
      })
  })
  it.skip('should update an order', (done) => {
    request
      .post(`/order/${orderID}`)
      .send({

      })
      .expect(200)
      .end((err, res) => {
        // console.log('ORDERS COUNT', res.body)
        done(err)
      })
  })
})
