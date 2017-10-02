'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User CouponController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['CouponController'])
  })
  it('should  not get coupons', (done) => {
    publicUser
      .get('/coupons')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
