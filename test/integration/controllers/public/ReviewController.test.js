'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User ReviewController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['ReviewController'])
  })
  it('should not get reviews', (done) => {
    publicUser
      .get('/reviews')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
