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
        // console.log('COUNT ORDERS', res.body.orders)
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
            gateway: 'payment_processor',
            token: '123'
          }
        ]

      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS ORDER', res.body)
        assert.ok(res.body.id)
        orderID = res.body.id
        assert.equal(res.body.cart_token, cartToken)
        assert.equal(res.body.email, 'example@example.com')
        // Shipping
        assert.equal(res.body.shipping_address.first_name, 'Scott')
        assert.equal(res.body.shipping_address.last_name, 'Wyatt')
        assert.equal(res.body.shipping_address.address_1, '1 Infinite Loop')
        assert.equal(res.body.shipping_address.city, 'Cupertino')
        assert.equal(res.body.shipping_address.province, 'California')
        assert.equal(res.body.shipping_address.province_code, 'CA')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.country, 'United States')
        assert.equal(res.body.shipping_address.postal_code, '95014')
        assert.equal(res.body.total_items, 1)
        // console.log('ORDER ITEMS', res.body.order_items)
        // Defaults to not immediately fulfilled: fulfillment_status: none
        assert.equal(res.body.order_items[0].fulfillment_id, null)
        done(err)
      })
  })
  it('should update an order', (done) => {
    request
      .post(`/order/${orderID}`)
      .send({
        shipping_address: {
          first_name: 'Scottie',
          last_name: 'W'
        },
        billing_address: {}
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS ORDER', res.body)
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.cart_token, cartToken)
        assert.equal(res.body.email, 'example@example.com')
        assert.equal(res.body.shipping_address.first_name, 'Scottie')
        assert.equal(res.body.shipping_address.last_name, 'W')
        assert.equal(res.body.shipping_address.address_1, '1 Infinite Loop')
        assert.equal(res.body.shipping_address.city, 'Cupertino')
        assert.equal(res.body.shipping_address.province, 'California')
        assert.equal(res.body.shipping_address.province_code, 'CA')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.country, 'United States')
        assert.equal(res.body.shipping_address.postal_code, '95014')
        assert.equal(res.body.total_items, 1)
        done(err)
      })
  })
  it.skip('should add an item to order', (done) => {
  })
  it.skip('should remove an item from order', (done) => {
  })
  it.skip('should pay an order', (done) => {
  })
  it.skip('should partially refund an order', (done) => {
  })
  it.skip('should refund an order', (done) => {
  })
  it('should cancel an order', (done) => {
    request
      .post(`/order/${orderID}/cancel`)
      .send({
        cancel_reason: 'customer'
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.ok(res.body.cancelled_at)
        assert.ok(res.body.closed_at)
        assert.equal(res.body.cancel_reason, 'customer')
        done(err)
      })
  })
})
