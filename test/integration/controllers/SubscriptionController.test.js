'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('SubscriptionController', () => {
  let request, uploadID

  before(() => {
    request = supertest('http://localhost:3000')
  })
  it('should exist', () => {
    assert(global.app.api.controllers['SubscriptionController'])
  })
  it('should get general stats', (done) => {
    request
      .get('/subscription/generalStats')
      .expect(200)
      .end((err, res) => {
        // console.log('GENERAL STATS')
        assert.ok(res.body)
        done(err)
      })
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
  it('It should upload subscription_upload.csv', (done) => {
    request
      .post('/subscription/uploadCSV')
      .attach('csv', 'test/fixtures/subscription_upload.csv')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.subscriptions, 1)
        done()
      })
  })
  it('It should process upload', (done) => {
    request
      .post(`/subscription/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.subscriptions, 1)
        done()
      })
  })
  it('It should get subscriptions', (done) => {
    request
      .get('/subscription')
      .expect(200)
      .end((err, res) => {

        console.log('SUBSCRIPTION UPLOAD', res.body)

        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.body)
        done()
      })
  })
})
