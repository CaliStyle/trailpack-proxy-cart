'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Quantity', () => {
  let adminUser, userID, customerID, cartID, shopID, shopProducts, orderID, transactionID

  before((done) => {
    shopID = global.app.shopID
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
        cartID = res.body.user.current_cart_id
        done(err)
      })
  })
  it('should add product to cart', done => {
    adminUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            variant_id: shopProducts[13].variants[0].id,
            quantity: 2
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        // console.log('THIS QUANTITY', res.body)
        assert.equal(res.body.subtotal_price, shopProducts[13].variants[0].price * 2)
        assert.equal(res.body.total_line_items_price, shopProducts[13].variants[0].price * 2)
        done(err)
      })
  })
  it('should checkout added items', (done) => {
    adminUser
      .post('/cart/checkout')
      .send({
        payment_kind: 'manual',
        transaction_kind: 'authorize',
        payment_details: [
          {
            gateway: 'payment_processor',
            gateway_token: '123'
          }
        ],
        fulfillment_kind: 'immediate'
      })
      .expect(200)
      .end((err, res) => {
        orderID = res.body.order.id

        // console.log('BROKE USER STORY', res.body.order)

        assert.ok(res.body.order.id)
        assert.ok(res.body.order.token)
        assert.equal(res.body.order.customer_id, customerID)
        assert.equal(res.body.order.payment_kind, 'manual')
        assert.equal(res.body.order.transaction_kind, 'authorize')
        assert.equal(res.body.order.fulfillment_kind, 'immediate')

        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.equal(res.body.order.financial_status, 'pending')

        // This is a digital good
        assert.equal(res.body.order.fulfillment_status, 'pending')
        assert.equal(res.body.order.status, 'open')
        // assert.equal(_.isString(res.body.order.closed_at), true)

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[13].price * 2)
        assert.equal(res.body.order.subtotal_price, shopProducts[13].price * 2)
        assert.equal(res.body.order.total_price, shopProducts[13].price * 2)
        assert.equal(res.body.order.total_due, shopProducts[13].price * 2)
        assert.equal(res.body.order.total_discounts, 0)
        assert.equal(res.body.order.total_captured, 0)


        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 2)
        assert.equal(res.body.order.order_items[0].price, shopProducts[13].price * 2)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[13].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[13].price * 2)
        assert.equal(res.body.order.order_items[0].total_discounts, 0)

        // assert.equal(res.body.order.order_items[0].properties['engraving']['value'], 'CUSTOM Engraving')
        // assert.equal(res.body.order.order_items[0].properties['engraving']['price'], 100)

        res.body.order.order_items.forEach(item => {
          assert.equal(item.order_id, orderID)
          assert.equal(item.fulfillment_status, 'pending')
          assert.equal(item.fulfillment_id, res.body.order.fulfillments[0].id)
        })

        // Fulfillment
        assert.equal(res.body.order.fulfillments.length, 1)
        res.body.order.fulfillments.forEach(fulfillment => {
          assert.equal(fulfillment.status, 'pending')
          assert.equal(fulfillment.order_id, orderID)
        })
        assert.equal(res.body.order.total_pending_fulfillments, 1)
        assert.equal(res.body.order.total_sent_fulfillments, 0)
        assert.equal(res.body.order.total_fulfilled_fulfillments, 0)
        assert.equal(res.body.order.total_partial_fulfillments, 0)

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        transactionID = res.body.order.transactions[0].id
        res.body.order.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'pending')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.order.total_pending, shopProducts[13].price * 2)
        assert.equal(res.body.order.total_authorized, 0)
        assert.equal(res.body.order.total_voided, 0)
        assert.equal(res.body.order.total_cancelled, 0)
        assert.equal(res.body.order.total_refunds, 0)
        assert.equal(res.body.order.total_captured, 0)

        done(err)
      })
  })
  it('should remove an item quantity', (done) => {
    adminUser
      .post(`/order/${orderID}/removeItem`)
      .send({
        variant_id: shopProducts[13].variants[0].id,
        quantity: 1
      })
      .expect(200)
      .end((err, res) => {
        // console.log('WORKING HERE', res.body)

        assert.equal(res.body.payment_kind, 'manual')
        assert.equal(res.body.transaction_kind, 'authorize')
        assert.equal(res.body.fulfillment_kind, 'immediate')

        assert.equal(res.body.currency, 'USD')
        assert.equal(res.body.source_name, 'api')
        assert.equal(res.body.processing_method, 'checkout')
        assert.equal(res.body.financial_status, 'pending')

        // This is a digital good
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.status, 'open')

        // Order Items
        assert.equal(res.body.order_items.length, 1)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.order_items[0].price, shopProducts[13].price)
        assert.equal(res.body.order_items[0].price_per_unit, shopProducts[13].price)
        assert.equal(res.body.order_items[0].calculated_price, shopProducts[13].price)
        assert.equal(res.body.order_items[0].total_discounts, 0)

        // assert.equal(res.body.order_items[0].properties['engraving']['value'], 'CUSTOM Engraving')
        // assert.equal(res.body.order_items[0].properties['engraving']['price'], 100)

        res.body.order_items.forEach(item => {
          assert.equal(item.order_id, orderID)
          assert.equal(item.fulfillment_status, 'pending')
          assert.equal(item.fulfillment_id, res.body.fulfillments[0].id)
        })

        // Fulfillment
        assert.equal(res.body.fulfillments.length, 1)
        res.body.fulfillments.forEach(fulfillment => {
          assert.equal(fulfillment.status, 'pending')
          assert.equal(fulfillment.order_id, orderID)
        })
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.total_sent_fulfillments, 0)
        assert.equal(res.body.total_fulfilled_fulfillments, 0)
        assert.equal(res.body.total_partial_fulfillments, 0)

        // Transactions
        assert.equal(res.body.transactions.length, 1)
        transactionID = res.body.transactions[0].id
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'pending')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.total_pending, shopProducts[13].price)
        assert.equal(res.body.total_authorized, 0)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_cancelled, 0)
        assert.equal(res.body.total_refunds, 0)
        assert.equal(res.body.total_captured, 0)

        done(err)
      })
  })

  it('should remove another item quantity', (done) => {
    adminUser
      .post(`/order/${orderID}/removeItem`)
      .send({
        variant_id: shopProducts[13].variants[0].id,
        quantity: 1
      })
      .expect(200)
      .end((err, res) => {
        console.log('WORKING HERE 2', res.body)

        assert.equal(res.body.payment_kind, 'manual')
        assert.equal(res.body.transaction_kind, 'authorize')
        assert.equal(res.body.fulfillment_kind, 'immediate')

        assert.equal(res.body.currency, 'USD')
        assert.equal(res.body.source_name, 'api')
        assert.equal(res.body.processing_method, 'checkout')
        assert.equal(res.body.financial_status, 'pending')

        // This is a digital good
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.status, 'open')

        // Order Items
        assert.equal(res.body.order_items.length, 0)
        assert.equal(res.body.total_items, 0)
        // assert.equal(res.body.order_items[0].price, 0)
        // assert.equal(res.body.order_items[0].price_per_unit, 0)
        // assert.equal(res.body.order_items[0].calculated_price, 0)
        // assert.equal(res.body.order_items[0].total_discounts, 0)

        // assert.equal(res.body.order_items[0].properties['engraving']['value'], 'CUSTOM Engraving')
        // assert.equal(res.body.order_items[0].properties['engraving']['price'], 100)

        res.body.order_items.forEach(item => {
          assert.equal(item.order_id, orderID)
          assert.equal(item.fulfillment_status, 'pending')
          assert.equal(item.fulfillment_id, res.body.fulfillments[0].id)
        })

        // Fulfillment
        // This fulfillment should still be here, because we don't want to destroy the record of it
        assert.equal(res.body.fulfillments.length, 1)
        res.body.fulfillments.forEach(fulfillment => {
          assert.equal(fulfillment.status, 'pending')
          assert.equal(fulfillment.order_id, orderID)
        })
        assert.equal(res.body.total_pending_fulfillments, 1)
        assert.equal(res.body.total_sent_fulfillments, 0)
        assert.equal(res.body.total_fulfilled_fulfillments, 0)
        assert.equal(res.body.total_partial_fulfillments, 0)

        // Transactions
        // The Transaction should still be here because we want to keep the record.
        assert.equal(res.body.transactions.length, 1)
        transactionID = res.body.transactions[0].id
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'pending')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.total_pending, 0)
        assert.equal(res.body.total_authorized, 0)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_cancelled, 0)
        assert.equal(res.body.total_refunds, 0)
        assert.equal(res.body.total_captured, 0)

        done(err)
      })
  })
})
