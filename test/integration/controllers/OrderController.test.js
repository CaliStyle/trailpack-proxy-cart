'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('OrderController', () => {
  let request
  let orderID
  let cartID
  let cartToken
  let shopProducts

  before((done) => {
    shopProducts = global.app.shopProducts
    request = supertest('http://localhost:3000')
    request
      .post('/cart')
      .send({
        line_items: [
          {
            product_id: shopProducts[1].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        assert.ok(res.body.token)
        cartID = res.body.id
        cartToken = res.body.token
        done(err)
      })
  })
  it('should exist', () => {
    assert(global.app.api.controllers['OrderController'])
  })
  it('should count all orders', (done) => {
    request
      .get('/order/count')
      .expect(200)
      .end((err, res) => {
        assert.ok(_.isNumber(res.body.orders))
        done(err)
      })
  })
  it('should create an order', (done) => {
    request
      .post('/order')
      .send({
        shipping_address: {
          first_name: 'Scott',
          last_name: 'Wyatt',
          address_1: '1 Infinite Loop',
          city: 'Cupertino',
          province: 'California',
          country: 'United States',
          postal_code: '95014'
        },
        cart_token: cartToken,
        email: 'example@example.com',
        payment_details: [
          {
            token: '123'
          }
        ]

      })
      .expect(200)
      .end((err, res) => {
        console.log('THIS ORDER', res.body)
        assert.ok(res.body.id)
        orderID = res.body.id
        done(err)
      })
  })
  it('should update an order', (done) => {
    request
      .post(`/order/${orderID}`)
      .send({
        shipping_address: {},
        billing_address: {}
      })
      .expect(200)
      .end((err, res) => {
        // console.log('ORDERS COUNT', res.body)
        done(err)
      })
  })
})
