'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Registered User Login and Logout', () => {
  let registeredUser, userID, customerID, cartID, shopID,
    shopProducts, recovery

  before((done) => {
    shopID = global.app.shopID
    shopProducts = global.app.shopProducts

    registeredUser = supertest.agent(global.app.packs.express.server)

    registeredUser.post('/auth/local/register')
      .send({
        email: 'loginlogout@example.com',
        password: 'admin1234'
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.user.id)
        assert.ok(res.body.user.current_customer_id)
        userID = res.body.user.id
        customerID = res.body.user.current_customer_id
        cartID = res.body.user.current_cart_id
        done(err)
      })
  })


  it('should logout', done => {

    registeredUser
      .post('/auth/logout')
      .send({})
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        done()
      })
  })
  it('should logback in', done => {
    registeredUser
      .post('/auth/local')
      .send({
        identifier: 'loginlogout@example.com',
        password: 'admin1234',
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        console.log('This User', res.body)
        assert.ok(res.body.user.id, userID)
        assert.equal(res.body.user.current_customer_id, customerID)
        assert.equal(res.body.user.current_cart_id, cartID)
        done(err)
      })
  })

  it('should logout', done => {
    registeredUser
      .post('/auth/logout')
      .send({})
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        done()
      })
  })

  it('should start a recovery', (done) => {
    registeredUser
      .post('/auth/recover')
      .set('Accept', 'application/json') //set header for this test
      .send({
        identifier: 'loginlogout@example.com'
      })
      .expect(200)
      .end((err, res) => {
        // console.log('BROKE', res.body)
        assert.equal(res.body.redirect, '/')
        // assert.equal(res.body.user.username, 'newuser')
        // recovery = res.body.user.recovery
        done(err)
      })
  })
  it('should get the recovery of the user', (done) => {
    global.app.orm['User'].findById(userID)
      .then(user => {
        recovery = user.recovery
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should end a recovery and customer id and cart id should be the same', (done) => {
    registeredUser
      .post('/auth/local/recover')
      .set('Accept', 'application/json') //set header for this test
      .send({
        recovery: recovery,
        password: 'adminNewNew'
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.equal(res.body.user.email, 'loginlogout@example.com')
        assert.equal(res.body.user.current_customer_id, customerID)
        assert.equal(res.body.user.current_cart_id, cartID)
        assert.equal()
        done(err)
      })
  })
})
