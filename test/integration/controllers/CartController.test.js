'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const products = require('../../fixtures/products')

describe('CartController', () => {
  let request
  let cartID
  let storeProducts
  before((done) => {
    request = supertest('http://localhost:3000')
    request
      .post('/product/addProducts')
      .send(products)
      .expect(200)
      .end((err, res) => {
        storeProducts = res.body
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.controllers['CartController'])
  })
  it('should count all carts', (done) => {
    request
      .get('/cart/count')
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })
  it('should make addItems post request with just a product_id', (done) => {
    request
      .post('/cart/addItems')
      .send([
        {
          product_id: storeProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })

  it('should make removeItems post request with just a product_id', (done) => {
    request
      .post('/cart/removeItems')
      .send([
        {
          product_id: storeProducts[0].id
        }
      ])
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
