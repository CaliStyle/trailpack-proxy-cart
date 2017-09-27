'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User ProductController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['ProductController'])
  })
})
