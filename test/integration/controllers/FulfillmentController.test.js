'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
// const _ = require('lodash')

describe('FulfillmentController', () => {
  let request

  before(() => {
    request = supertest('http://localhost:3000')
  })
  it('should exist', () => {
    assert(global.app.api.controllers['FulfillmentController'])
  })
  it('should get general stats', (done) => {
    request
      .get('/fulfillment/generalStats')
      .expect(200)
      .end((err, res) => {
        // console.log('GENERAL STATS')
        assert.ok(res.body)
        done(err)
      })
  })
  it.skip('should create a manual fulfillment',() => {

  })
  it.skip('should update a manual fulfillment',() => {

  })
  it.skip('should destroy a manual fulfillment',() => {

  })

})
