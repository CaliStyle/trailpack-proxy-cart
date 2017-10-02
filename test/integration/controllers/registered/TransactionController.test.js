'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Registered User TransactionController', () => {
  let registeredUser, userID, customerID

  before((done) => {

    registeredUser = supertest.agent(global.app.packs.express.server)
    // Login as Registered
    registeredUser
      .post('/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({
        email: 'transactioncontroller@example.com',
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
    assert(global.app.api.controllers['TransactionController'])
  })
  it('should not get all transactions', (done) => {
    registeredUser
      .get('/transactions')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
