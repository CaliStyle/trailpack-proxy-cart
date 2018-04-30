'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User OrderController', () => {
  let adminUser, userID, customerID
  let orderID
  let cartID
  let cartToken
  let shopProducts
  let transactionID
  let fulfillmentID

  before((done) => {
    shopProducts = global.app.shopProducts
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
    assert(global.app.api.controllers['GatewayController'])
  })
  it('should get general stats', (done) => {
    adminUser
      .get('/gateways')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        console.log('WORKING ON GATEWAYS', res.body)
        done(err)
      })
  })
})
