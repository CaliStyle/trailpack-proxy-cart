'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User DiscountController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['DiscountController'])
  })
  it('should  not get discounts', (done) => {
    publicUser
      .get('/discounts')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
