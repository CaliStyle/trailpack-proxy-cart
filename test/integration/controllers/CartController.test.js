'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('CartController', () => {
  let request

  before((done) => {
    request = supertest('http://localhost:3000')
    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['CartController'])
  })

  it('should make addItems post request', (done) => {
    request
      .post('/cart/addItems')
      .send([])
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })

  it('should make removeItems post request', (done) => {
    request
      .post('/cart/removeItems')
      .send([])
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })

  it.skip('should make checkout post request', (done) => {
    request
      .post('/cart/checkout')
      .send({})
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })

  it('should make clearCart post request', (done) => {
    request
      .post('/cart/clear')
      .send({})
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })
})
