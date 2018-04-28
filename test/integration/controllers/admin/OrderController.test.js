'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User OrderController', () => {
  let adminUser, userID, customerID
  let orderID
  let cartID
  let cartToken
  let shopProducts
  let transactionID
  let fulfillmentID

  before((done) => {
    shopProducts = global.app.shopProducts
    adminUser = supertest.agent(global.app.packs.express.server)
    // Login as Admin
    adminUser
      .post('/auth/local')
      .set('Accept', 'application/json') //set header for this test
      .send({username: 'admin', password: 'admin1234'})
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.user.id)
        assert.ok(res.body.user.current_customer_id)
        userID = res.body.user.id
        customerID = res.body.user.current_customer_id
        done(err)
      })
  })
  it('should exist', () => {
    assert(global.app.api.controllers['OrderController'])
  })
  it('should add item to cart', (done) => {
    adminUser
      .post('/cart')
      .send({
        customer_id: 1,
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

  it('should get general stats', (done) => {
    adminUser
      .get('/order/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should count all orders', (done) => {
    adminUser
      .get('/order/count')
      .expect(200)
      .end((err, res) => {
        assert.ok(_.isNumber(res.body.orders))
        done(err)
      })
  })
  it('should create an order', (done) => {
    adminUser
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
        payment_kind: 'immediate',
        payment_details: [
          {
            gateway: 'payment_processor',
            gateway_token: '123'
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
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
        // Transactions
        assert.equal(res.body.transactions.length, 1)
        assert.equal(res.body.transactions[0].order_id, orderID)

        // Fulfillments
        // Defaults to not immediately fulfilled: fulfillment_status: none
        assert.ok(res.body.order_items[0].fulfillment_id)
        assert.equal(res.body.order_items[0].fulfillment_status, 'pending')
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        fulfillmentID = res.body.fulfillments[0].id

        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_authorized, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_items, 1)

        done(err)
      })
  })
  it('should update an order', (done) => {
    adminUser
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

        // Transactions
        assert.equal(res.body.transactions.length, 1)
        assert.equal(res.body.transactions[0].order_id, orderID)

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')
        assert.equal(res.body.fulfillments[0].total_pending_fulfillments, 1)

        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_authorized, 100000)
        assert.equal(res.body.total_items, 1)

        done(err)
      })
  })
  it('should add an item to order', (done) => {
    adminUser
      .post(`/order/${orderID}/addItem`)
      .send({
        product_id: shopProducts[2].id,
        quantity: 1,
        properties: [{ hello: 'world' }]
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 2)
        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.fulfillment_status, 'pending')

        // Transactions
        assert.equal(res.body.transactions.length, 2)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'success')
        })

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')
        assert.equal(res.body.fulfillments[0].total_pending_fulfillments, 2)

        assert.equal(res.body.subtotal_price, 200000)
        assert.equal(res.body.total_price, 200000)
        assert.equal(res.body.total_due, 200000)
        assert.equal(res.body.total_authorized, 200000)
        assert.equal(res.body.total_items, 2)
        done(err)
      })
  })
  it('should update an item to order', (done) => {
    adminUser
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

        // Transactions
        assert.equal(res.body.transactions.length, 3)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'success')
        })

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')
        assert.equal(res.body.fulfillments[0].total_pending_fulfillments, 3)

        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.subtotal_price, 300000)
        assert.equal(res.body.total_price, 300000)
        assert.equal(res.body.total_due, 300000)
        assert.equal(res.body.total_authorized, 300000)
        assert.equal(res.body.total_items, 3)
        done(err)
      })
  })
  it('should remove an item quantity from order', (done) => {
    adminUser
      .post(`/order/${orderID}/removeItem`)
      .send({
        product_id: shopProducts[2].id,
        quantity: 1
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 2)
        // Transactions
        assert.equal(res.body.transactions.length, 3)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'success')
        })

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')
        assert.equal(res.body.fulfillments[0].total_pending_fulfillments, 2)

        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.subtotal_price, 200000)
        assert.equal(res.body.total_price, 200000)
        assert.equal(res.body.total_due, 200000)
        assert.equal(res.body.total_authorized, 200000)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_items, 2)
        assert.equal(res.body.total_shipping, 0)
        assert.equal(res.body.total_tax, 0)
        done(err)
      })
  })
  it('should completely remove an item from order', (done) => {
    adminUser
      .post(`/order/${orderID}/removeItem`)
      .send({
        product_id: shopProducts[2].id,
        quantity: 1
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 1)

        // Transactions
        assert.equal(res.body.transactions.length, 3)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'success')
        })

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')
        assert.equal(res.body.fulfillments[0].total_pending_fulfillments, 1)

        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_authorized, 100000)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.total_shipping, 0)
        assert.equal(res.body.total_tax, 0)
        done(err)
      })
  })
  it('should add shipping to order', (done) => {
    adminUser
      .post(`/order/${orderID}/addShipping`)
      .send({
        name: 'Test Shipping',
        price: 100
      })
      .expect(200)
      .end((err, res) => {
        // Transactions
        assert.equal(res.body.transactions.length, 4)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'success')
        })

        // Shipping Lines
        assert.equal(res.body.shipping_lines.length, 1)
        assert.equal(res.body.shipping_lines[0].name, 'Test Shipping')
        assert.equal(res.body.shipping_lines[0].price, 100)

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')

        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100100)
        assert.equal(res.body.total_due, 100100)
        assert.equal(res.body.total_authorized, 100100)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.total_shipping, 100)
        assert.equal(res.body.total_tax, 0)
        done(err)
      })
  })
  it('should remove shipping from order', (done) => {
    adminUser
      .post(`/order/${orderID}/removeShipping`)
      .send({
        name: 'Test Shipping',
        price: 100
      })
      .expect(200)
      .end((err, res) => {
        // Transactions
        assert.equal(res.body.transactions.length, 4)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'success')
        })

        // Shipping Lines
        assert.equal(res.body.shipping_lines.length, 0)

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')

        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_authorized, 100000)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.total_shipping, 0)
        assert.equal(res.body.total_tax, 0)
        done(err)
      })
  })

  it('should add taxes to order', (done) => {
    adminUser
      .post(`/order/${orderID}/addTaxes`)
      .send({
        name: 'Test Taxes',
        price: 100
      })
      .expect(200)
      .end((err, res) => {
        // Transactions
        assert.equal(res.body.transactions.length, 5)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'success')
        })

        // Taxes Lines
        assert.equal(res.body.tax_lines.length, 1)
        assert.equal(res.body.tax_lines[0].name, 'Test Taxes')
        assert.equal(res.body.tax_lines[0].price, 100)

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')

        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100100)
        assert.equal(res.body.total_due, 100100)
        assert.equal(res.body.total_authorized, 100100)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.total_shipping, 0)
        assert.equal(res.body.total_tax, 100)
        done(err)
      })
  })
  it('should remove taxes from order', (done) => {
    adminUser
      .post(`/order/${orderID}/removeTaxes`)
      .send({
        name: 'Test Taxes',
        price: 100
      })
      .expect(200)
      .end((err, res) => {
        // Transactions
        assert.equal(res.body.transactions.length, 5)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'success')
        })

        // Taxes Lines
        assert.equal(res.body.tax_lines.length, 0)

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')

        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_authorized, 100000)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.total_tax, 0)
        assert.equal(res.body.total_shipping, 0)
        done(err)
      })
  })
  it('should pay an order', (done) => {
    adminUser
      .post(`/order/${orderID}/pay`)
      .send({
        payment_details: [
          {
            gateway: 'payment_processor',
            gateway_token: '123'
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.financial_status, 'paid')

        // Transactions
        assert.equal(res.body.transactions.length, 5)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'capture')
          assert.equal(transaction.status, 'success')
        })

        const transaction = res.body.transactions.find(transaction => transaction.amount > 0)
        transactionID = transaction.id

        assert.equal(res.body.total_captured, 100000)
        assert.equal(res.body.total_due, 0)

        done(err)
      })
  })
  it('should fulfill an order', (done) => {
    adminUser
      .post(`/order/${orderID}/fulfill`)
      .send({
        id: fulfillmentID,
        status: 'sent',
        status_url: 'https://cali-style.com/status',
        tracking_company: 'UPS',
        tracking_number: '1111',
        // receipt: {
        //   done: 'today'
        // }
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.financial_status, 'paid')
        assert.equal(res.body.fulfillment_status, 'sent')

        // Fulfillments
        res.body.fulfillments.forEach(item => {
          assert.equal(item.status, 'sent')
          assert.equal(item.total_sent_to_fulfillment, 1)
        })
        // Order Items
        res.body.order_items.forEach(item => {
          assert.equal(item.fulfillment_status, 'sent')
        })

        // Transactions
        assert.equal(res.body.transactions.length, 5)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'capture')
          assert.equal(transaction.status, 'success')
        })
        assert.equal(res.body.total_captured, 100000)
        assert.equal(res.body.total_due, 0)

        assert.equal(res.body.fulfillments.length, 1)

        done(err)
      })
  })

  it('should partially refund an order', (done) => {
    adminUser
      .post(`/order/${orderID}/refund`)
      .send([{
        transaction: transactionID,
        amount: 100
      }])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)

        // Transactions
        assert.equal(res.body.transactions.length, 6)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.status, 'success')
        })

        // Refunds
        assert.equal(res.body.refunds.length, 1)
        res.body.refunds.forEach(refund => {
          assert.equal(refund.order_id, orderID)
        })

        assert.equal(res.body.financial_status, 'partially_refunded')
        assert.equal(res.body.total_refunds, 100)
        assert.equal(res.body.total_due, 100)
        done(err)
      })
  })
  it('should refund an order', (done) => {
    adminUser
      .post(`/order/${orderID}/refund`)
      .send([])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.financial_status, 'refunded')
        assert.equal(res.body.total_refunds, 100000)
        assert.equal(res.body.total_due, 100000)

        // Transactions
        assert.equal(res.body.transactions.length, 6)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'refund')
          assert.equal(transaction.status, 'success')
        })

        assert.equal(res.body.refunds.length, 6)
        res.body.refunds.forEach(refund => {
          assert.equal(refund.order_id, orderID)
        })

        done(err)
      })
  })
  it('should add tag to an order', (done) => {
    adminUser
      .post(`/order/${orderID}/addTag/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.tags.length, 1)
        done(err)
      })
  })
  it('should remove tag from an order', (done) => {
    adminUser
      .post(`/order/${orderID}/removeTag/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.tags.length, 0)
        done(err)
      })
  })
  it('should cancel an order', (done) => {
    adminUser
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
        assert.equal(res.body.total_cancelled_fulfillments, 1)

        // Fulfillments
        res.body.fulfillments.forEach(item => {
          assert.equal(item.status, 'cancelled')
          assert.equal(item.total_cancelled, 1)
        })

        // Order Items
        res.body.order_items.forEach(item => {
          assert.equal(item.fulfillment_status, 'cancelled')
        })

        done(err)
      })
  })
  it('should get an order refunds', (done) => {
    adminUser
      .get(`/order/${orderID}/refunds`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
        assert.ok(res.headers['x-pagination-sort'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        done(err)
      })
  })
  it('should get an order transactions', (done) => {
    adminUser
      .get(`/order/${orderID}/transactions`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
        assert.ok(res.headers['x-pagination-sort'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        assert.equal(_.isNumber(res.body.length), true)

        done(err)
      })
  })
  it('should get an order fulfillments', (done) => {
    adminUser
      .get(`/order/${orderID}/fulfillments`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
        assert.ok(res.headers['x-pagination-sort'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        assert.equal(_.isNumber(res.body.length), true)

        done(err)
      })
  })
  it('should search orders', (done) => {
    adminUser
      .get('/order/search')
      .query({
        term: '1'
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
        assert.ok(res.headers['x-pagination-sort'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        assert.equal(_.isNumber(res.body.length), true)
        done(err)
      })
  })

  it('should add item to a new cart', (done) => {
    adminUser
      .post('/cart')
      .send({
        customer_id: 1,
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
  it('should create an order', (done) => {
    adminUser
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
        payment_kind: 'immediate',
        payment_details: [
          {
            gateway: 'payment_processor',
            gateway_token: '123'
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
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
        // Transactions
        assert.equal(res.body.transactions.length, 1)
        assert.equal(res.body.transactions[0].order_id, orderID)

        // Fulfillments
        // Defaults to not immediately fulfilled: fulfillment_status: none
        assert.ok(res.body.order_items[0].fulfillment_id)
        assert.equal(res.body.order_items[0].fulfillment_status, 'pending')
        assert.equal(res.body.fulfillments.length, 1)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.total_pending_fulfillments, 1)
        fulfillmentID = res.body.fulfillments[0].id

        assert.equal(res.body.financial_status, 'authorized')
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_authorized, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_items, 1)

        done(err)
      })
  })
  it('should update order fulfillment', (done) => {
    adminUser
      .put(`/order/${orderID}/fulfillment/${fulfillmentID}`)
      .send({
        status: 'sent',
        status_url: 'test',
        tracking_company: 'test',
        tracking_number: '123'
      })
      .expect(200)
      .end((err, res) => {
        // console.log('BROKE MANUAL FULFILLMENT UPDATE', res.body)
        assert.equal(res.body.order.fulfillment_status, 'sent')
        assert.equal(res.body.fulfillment.status, 'sent')
        assert.equal(res.body.fulfillment.status_url, 'test')
        assert.equal(res.body.fulfillment.tracking_company, 'test')
        assert.equal(res.body.fulfillment.tracking_number, '123')
        done(err)
      })
  })
})
