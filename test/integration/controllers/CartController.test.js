'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const products = require('../../fixtures/products')
const customers = require('../../fixtures/customers')

describe('CartController', () => {
  let request
  let cartID
  let customerID
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
      .post('/cart')
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        cartID = res.body.id
        done(err)
      })
  })
  it('should add cart to customer on creation',(done) => {
    const customer = customers[0]
    customer.cart = cartID
    request
      .post('/customer')
      .send(customer)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS CUSTOMER',res.body)
        customerID = res.body.id
        assert.equal(res.body.default_cart.id, cartID)
        assert.equal(res.body.carts.length, 1)
        done(err)
      })
  })
  it('should should get the created customer with cart',(done) => {
    request
      .get(`/customer/${customerID}`)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS CUSTOMER', res.body)
        assert.equal(res.body.id, customerID)
        assert.equal(res.body.default_cart.id, cartID)
        assert.equal(res.body.carts.length, 1)
        done(err)
      })
  })
  it('should make addItems post request with just a product_id', (done) => {
    request
      .post(`/cart/${cartID}/addItems`)
      .send([
        {
          product_id: storeProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, storeProducts[0].id)
        done(err)
      })
  })

  it('should make addItems post request and increment quantity', (done) => {
    request
      .post(`/cart/${cartID}/addItems`)
      .send([
        {
          product_id: storeProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, storeProducts[0].id)
        assert.equal(res.body.line_items[0].quantity, 2)
        done(err)
      })
  })

  it('should make removeItems post and decrease the quantity', (done) => {
    request
      .post(`/cart/${cartID}/removeItems`)
      .send([
        {
          product_id: storeProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, storeProducts[0].id)
        assert.equal(res.body.line_items[0].quantity, 1)
        done(err)
      })
  })

  it('should make removeItems post request with just a product_id', (done) => {
    request
      .post(`/cart/${cartID}/removeItems`)
      .send([
        {
          product_id: storeProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })

  it('should make clearCart post request', (done) => {
    request
      .post(`/cart/${cartID}/clear`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })
  it('should make addItems post for multiple items', (done) => {
    request
      .post(`/cart/${cartID}/addItems`)
      .send([
        {
          product_id: storeProducts[0].id
        },
        {
          product_id: storeProducts[1].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        console.log(res.body)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 2)
        assert.equal(res.body.line_items[0].product_id, storeProducts[0].id)
        assert.equal(res.body.line_items[0].quantity, 1)
        assert.equal(res.body.line_items[1].product_id, storeProducts[1].id)
        assert.equal(res.body.line_items[1].quantity, 1)
        done(err)
      })
  })
  it.skip('should make addCoupon request', (done) => {
  })
  it.skip('should make addDiscount request', (done) => {
  })
  it('should make checkout post request', (done) => {
    request
      .post(`/cart/${cartID}/checkout`)
      .send({})
      .expect(200)
      .end((err, res) => {
        console.log('CHECKOUT', res.body)
        done(err)
      })
  })
})
