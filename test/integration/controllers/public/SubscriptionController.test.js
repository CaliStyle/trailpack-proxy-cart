'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User SubscriptionController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['SubscriptionController'])
  })


  it('should not get general stats', (done) => {
    publicUser
      .get('/subscription/generalStats')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not count all subscriptions', (done) => {
    publicUser
      .get('/subscription/count')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not get subscriptions', (done) => {
    publicUser
      .get('/subscriptions')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it.skip('should not upload subscription_upload.csv', (done) => {
    publicUser
      .post('/subscription/uploadCSV')
      .attach('file', 'test/fixtures/subscription_upload.csv')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not process upload', (done) => {
    publicUser
      .post('/subscription/processUpload/1')
      .send({})
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
