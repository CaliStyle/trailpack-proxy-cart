'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('SubscriptionController', () => {
  let request
  before(() => {
    request = supertest('http://localhost:3000')
  })
  it('should exist', () => {
    assert(global.app.api.controllers['SubscriptionController'])
  })
  it('should count all subscriptions', (done) => {
    request
      .get('/subscription/count')
      .expect(200)
      .end((err, res) => {
        // console.log('SUBSCRIPTIONS COUNT', res.body)
        assert.ok(_.isNumber(res.body.subscriptions))
        done(err)
      })
  })
  it('It should get subscriptions', (done) => {
    request
      .get('/subscription')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.body)
        done()
      })
  })
})
