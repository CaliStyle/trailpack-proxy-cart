'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User FulfillmentController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['FulfillmentController'])
  })
  it.skip('should not create a manual fulfillment',() => {

  })
  it.skip('should not update a manual fulfillment',() => {

  })
  it.skip('should not destroy a manual fulfillment',() => {

  })
  it('should not get fulfillments', (done) => {
    publicUser
      .get('/fulfillments')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
