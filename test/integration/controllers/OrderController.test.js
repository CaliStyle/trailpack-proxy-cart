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
  let transactionID

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
  it('should get general stats', (done) => {
    request
      .get('/order/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
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
        orderID = res.body.id
        assert.ok(res.body.id)
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
        assert.ok(res.body.order_items[0].fulfillment_id)
        assert.equal(res.body.order_items[0].fulfillment_status, 'none')

        // assert.equal(res.body.financial_status, 'pending')
        assert.equal(res.body.fulfillment_status, 'none')
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_items, 1)

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

        // assert.equal(res.body.financial_status, 'pending')
        assert.equal(res.body.fulfillment_status, 'none')
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_items, 1)

        done(err)
      })
  })
  it('should add an item to order', (done) => {
    request
      .post(`/order/${orderID}/addItem`)
      .send({
        product_id: shopProducts[2].id,
        quantity: 1,
        properties: [{ hello: 'world' }]
      })
      .expect(200)
      .end((err, res) => {
        console.log('ADD ITEM',res.body)
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 2)
        // assert.equal(res.body.financial_status, 'pending')
        assert.equal(res.body.fulfillment_status, 'none')
        assert.equal(res.body.subtotal_price, 200000)
        assert.equal(res.body.total_price, 200000)
        assert.equal(res.body.total_due, 200000)
        assert.equal(res.body.total_items, 2)
        done(err)
      })
  })
  it('should update an item to order', (done) => {
    request
      .post(`/order/${orderID}/updateItem`)
      .send({
        product_id: shopProducts[2].id,
        quantity: 1,
        properties: [{ hello: 'moon' }]
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 2)
        // assert.equal(res.body.financial_status, 'pending')
        assert.equal(res.body.fulfillment_status, 'none')
        assert.equal(res.body.subtotal_price, 300000)
        assert.equal(res.body.total_price, 300000)
        assert.equal(res.body.total_due, 300000)
        assert.equal(res.body.total_items, 3)
        done(err)
      })
  })
  it('should remove an item quantity from order', (done) => {
    request
      .post(`/order/${orderID}/removeItem`)
      .send({
        product_id: shopProducts[2].id,
        quantity: 1
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 2)

        // assert.equal(res.body.financial_status, 'pending')
        assert.equal(res.body.fulfillment_status, 'none')
        assert.equal(res.body.subtotal_price, 200000)
        assert.equal(res.body.total_price, 200000)
        assert.equal(res.body.total_due, 200000)
        assert.equal(res.body.total_items, 2)
        done(err)
      })
  })
  it('should completely remove an item from order', (done) => {
    request
      .post(`/order/${orderID}/removeItem`)
      .send({
        product_id: shopProducts[2].id,
        quantity: 1
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 1)

        // assert.equal(res.body.financial_status, 'pending')
        assert.equal(res.body.fulfillment_status, 'none')
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_items, 1)
        done(err)
      })
  })
  it('should add shipping to order', (done) => {
    request
      .post(`/order/${orderID}/addShipping`)
      .send({
        name: 'Test Shipping',
        price: 100
      })
      .expect(200)
      .end((err, res) => {
        console.log('Add Shipping', res.body )
        assert.equal(res.body.total_shipping, 100)
        done(err)
      })
  })
  it('should remove shipping from order', (done) => {
    request
      .post(`/order/${orderID}/removeShipping`)
      .send({
        name: 'Test Shipping',
        price: 100
      })
      .expect(200)
      .end((err, res) => {
        console.log('Remove Shipping', res.body )
        assert.equal(res.body.total_shipping, 0)
        done(err)
      })
  })
  it('should pay an order', (done) => {
    request
      .post(`/order/${orderID}/pay`)
      .send({
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
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.financial_status, 'paid')

        transactionID = res.body.transactions[0].id
        assert.equal(res.body.transactions[0].kind, 'capture')
        assert.equal(res.body.transactions[0].status, 'success')

        done(err)
      })
  })
  it('should partially refund an order', (done) => {
    request
      .post(`/order/${orderID}/refund`)
      .send([{
        transaction: transactionID,
        amount: 100
      }])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.financial_status, 'partially_refunded')
        assert.equal(res.body.total_refunds, 100)
        assert.equal(res.body.total_due, 100)
        done(err)
      })
  })
  it('should refund an order', (done) => {
    request
      .post(`/order/${orderID}/refund`)
      .send([])
      .expect(200)
      .end((err, res) => {
        // console.log('THIS ORDER', res.body)
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.financial_status, 'refunded')
        assert.equal(res.body.total_refunds, 100000)
        assert.equal(res.body.total_due, 100000)
        // assert.equal(res.body.transactions[0].kind, 'refund')
        assert.equal(res.body.transactions[0].status, 'success')
        assert.equal(res.body.transactions[1].status, 'success')
        done(err)
      })
  })
  it('should add tag to an order', (done) => {
    request
      .post(`/order/${orderID}/addTag/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.tags.length, 1)
        done(err)
      })
  })
  it('should remove tag to an order', (done) => {
    request
      .post(`/order/${orderID}/removeTag/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.tags.length, 0)
        done(err)
      })
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
  it('should get an order refunds', (done) => {
    request
      .get(`/order/${orderID}/refunds`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        done(err)
      })
  })
  it('should get an order transactions', (done) => {
    request
      .get(`/order/${orderID}/transactions`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        done(err)
      })
  })
  it('should get an order fulfillments', (done) => {
    request
      .get(`/order/${orderID}/fulfillments`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        done(err)
      })
  })
  it('should search orders', (done) => {
    request
      .get('/order/search')
      .query({
        term: '1'
      })
      .expect(200)
      .end((err, res) => {
        // console.log('Order Search', res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.equal(res.body.length, 2)
        done(err)
      })
  })
})
