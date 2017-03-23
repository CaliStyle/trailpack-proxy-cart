'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('ShopController', () => {
  let request
  before(() => {
    request = supertest('http://localhost:3000')
  })
  it('should exist', () => {
    assert(global.app.api.controllers['ShopController'])
  })
  it('should count all subscriptions', (done) => {
    request
      .get('/shop/count')
      .expect(200)
      .end((err, res) => {
        assert.ok(_.isNumber(res.body.shops))
        done(err)
      })
  })
})
