'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User VendorController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['VendorController'])
  })
  it('should not get vendors', (done) => {
    publicUser
      .get('/vendors')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not get vendors', (done) => {
    publicUser
      .get('/vendors/search')
      .query({term: 'R.E.I'})
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
