'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User TransactionController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['TransactionController'])
  })
  it('should not get all transactions', (done) => {
    publicUser
      .get('/transactions')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
