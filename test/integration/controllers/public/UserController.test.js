'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User UserController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['UserController'])
  })
  it('should not get all users', (done) => {
    publicUser
      .get('/users')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
