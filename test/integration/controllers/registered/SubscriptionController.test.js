'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Registered User SubscriptionController', () => {
  let registeredUser, userID, customerID

  before((done) => {

    registeredUser = supertest.agent(global.app.packs.express.server)
    // Login as Registered
    registeredUser
      .post('/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({
        email: 'subscriptioncontroller@example.com',
        password: 'registered1234'
      })
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


  it('should not get general stats', (done) => {
    registeredUser
      .get('/subscription/generalStats')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not count all subscriptions', (done) => {
    registeredUser
      .get('/subscription/count')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('not should get subscriptions', (done) => {
    registeredUser
      .get('/subscriptions')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it.skip('It should not upload subscription_upload.csv', (done) => {
    registeredUser
      .post('/subscription/uploadCSV')
      .attach('file', 'test/fixtures/subscription_upload.csv')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('It should not process upload', (done) => {
    registeredUser
      .post('/subscription/processUpload/1')
      .send({})
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
