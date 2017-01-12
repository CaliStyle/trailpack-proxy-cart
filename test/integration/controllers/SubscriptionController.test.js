'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

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
        // assert.ok(res.body.subscriptions)
        done(err)
      })
  })
})
