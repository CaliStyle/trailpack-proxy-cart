'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User TagController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['TagController'])
  })
  it.skip('should not get tags', (done) => {
    publicUser
      .get('/tags')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
