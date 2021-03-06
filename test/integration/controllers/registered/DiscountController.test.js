'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Registered User DiscountController', () => {
  let registeredUser, userID, customerID

  before((done) => {

    registeredUser = supertest.agent(global.app.packs.express.server)
    // Login as Registered
    registeredUser
      .post('/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({
        email: 'discountcontroller@example.com',
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
    assert(global.app.api.controllers['DiscountController'])
  })
  it('should not get discounts', (done) => {
    registeredUser
      .get('/discounts')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not create a discount', (done) => {
    registeredUser
      .post('/discount')
      .send({
        hello: 'world'
      })
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not update a discount', (done) => {
    registeredUser
      .post('/discount/1')
      .send({
        applies_compound: true
      })
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not destroy a discount', (done) => {
    registeredUser
      .del('/discount/1')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
