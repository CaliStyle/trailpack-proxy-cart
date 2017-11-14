'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User FulfillmentController', () => {
  let adminUser, userID, customerID

  before((done) => {

    adminUser = supertest.agent(global.app.packs.express.server)
    // Login as Admin
    adminUser
      .post('/auth/local')
      .set('Accept', 'application/json') //set header for this test
      .send({username: 'admin', password: 'admin1234'})
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.user.id)
        assert.ok(res.body.user.current_customer_id)
        userID = res.body.user.id
        customerID = res.body.user.current_customer_id
        done(err)
      })
  })
  it('should exist', () => {
    assert(global.app.api.controllers['FulfillmentController'])
  })

  it('should get general stats', (done) => {
    adminUser
      .get('/fulfillment/generalStats')
      .expect(200)
      .end((err, res) => {
        // console.log('GENERAL STATS')
        assert.ok(res.body)
        done(err)
      })
  })
  it.skip('should create a manual fulfillment',(done) => {
    adminUser
      .post('/fulfillment')
      .send({

      })
      .expect(200)
      .end((err, res) => {
        // console.log('GENERAL STATS')
        assert.ok(res.body)
        done(err)
      })
  })
  it.skip('should update a manual fulfillment',() => {

  })
  it.skip('should destroy a manual fulfillment',() => {

  })
  it('should get fulfillments', (done) => {
    adminUser
      .get('/fulfillments')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
        assert.ok(res.headers['x-pagination-sort'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        assert.ok(res.body)
        done(err)
      })
  })
})
