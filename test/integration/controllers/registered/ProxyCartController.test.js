'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Registered User ProxyCartController', () => {
  let registeredUser, userID, customerID

  before((done) => {

    registeredUser = supertest.agent(global.app.packs.express.server)
    // Login as Registered
    registeredUser
      .post('/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({
        email: 'proxycartcontroller@example.com',
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
    assert(global.app.api.controllers['ProxyCartController'])
  })
  it.skip('should not get general stats', (done) => {
    registeredUser
      .get('/generalStats')
      .expect(401)
      .end((err, res) => {
        done(err)
      })
  })
  it('should get countries with provinces', (done) => {
    registeredUser
      .get('/countries')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COUNTRY', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].name, 'United States')
        assert.equal(res.body[0].code, 'US')
        assert.equal(res.body[0].provinces.length, 57)
        done(err)
      })
  })
  it('should get provinces', (done) => {
    registeredUser
      .get('/provinces')
      .query({
        limit: 57
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS Provinces', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 57)
        done(err)
      })
  })
})
