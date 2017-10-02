'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('Public User ProxyCartController', () => {
  let publicUser //, userID, customerID

  before((done) => {
    publicUser = supertest.agent(global.app.packs.express.server)
    done()
  })
  it('should exist', () => {
    assert(global.app.api.controllers['ProxyCartController'])
  })
  it('should not get general stats', (done) => {
    publicUser
      .get('/generalStats')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should get countries with provinces', (done) => {
    publicUser
      .get('/countries')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COUNTRY', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].name, 'United States')
        assert.equal(res.body[0].code, 'US')
        assert.equal(res.body[0].provinces.length, 57)
        done(err)
      })
  })
  it('should get provinces', (done) => {
    publicUser
      .get('/provinces')
      .query({
        limit: 57
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS Provinces', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 57)
        done(err)
      })
  })
})
