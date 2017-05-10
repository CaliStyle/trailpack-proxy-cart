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
  it('should get general stats', (done) => {
    request
      .get('/shop/generalStats')
      .expect(200)
      .end((err, res) => {
        console.log('GENERAL STATS')
        assert.ok(res.body)
        done(err)
      })
  })
  it('should count all shops', (done) => {
    request
      .get('/shop/count')
      .expect(200)
      .end((err, res) => {
        assert.ok(_.isNumber(res.body.shops))
        done(err)
      })
  })
})
