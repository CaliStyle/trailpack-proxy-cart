'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
// const _ = require('lodash')

describe('ProxyCartController', () => {
  let request

  before(() => {
    request = supertest('http://localhost:3000')
  })
  it('should exist', () => {
    assert(global.app.api.controllers['ProxyCartController'])
  })
  it('should get general stats', (done) => {
    request
      .get('/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should get countries with provinces', (done) => {
    request
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
    request
      .get('/provinces')
      .query({
        limit: 57
      })
      .expect(200)
      .end((err, res) => {
        console.log('THIS Provinces', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 57)
        done(err)
      })
  })
})
