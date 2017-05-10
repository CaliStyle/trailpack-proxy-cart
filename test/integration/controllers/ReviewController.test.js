'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
// const _ = require('lodash')

describe('ReviewController', () => {
  let request

  before(() => {
    request = supertest('http://localhost:3000')
  })
  it('should exist', () => {
    assert(global.app.api.controllers['ReviewController'])
  })
  it('should get general stats', (done) => {
    request
      .get('/review/generalStats')
      .expect(200)
      .end((err, res) => {
        console.log('GENERAL STATS')
        assert.ok(res.body)
        done(err)
      })
  })

})
