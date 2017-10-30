'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User SubscriptionController', () => {
  let adminUser, userID, customerID, uploadID

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
    assert(global.app.api.controllers['SubscriptionController'])
  })
  it('should get general stats', (done) => {
    adminUser
      .get('/subscription/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should count all subscriptions', (done) => {
    adminUser
      .get('/subscription/count')
      .expect(200)
      .end((err, res) => {
        assert.ok(_.isNumber(res.body.subscriptions))
        done(err)
      })
  })
  it('It should upload subscription_upload.csv', (done) => {
    adminUser
      .post('/subscription/uploadCSV')
      .attach('file', 'test/fixtures/subscription_upload.csv')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.subscriptions, 1)
        done(err)
      })
  })
  it('It should process upload', (done) => {
    adminUser
      .post(`/subscription/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.subscriptions, 1)
        assert.equal(res.body.errors_count, 0)
        done(err)
      })
  })
  it('It should get subscriptions', (done) => {
    adminUser
      .get('/subscriptions')
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
