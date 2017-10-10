'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Manual Authorize and Capture', () => {
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
  it('should add product to cart that has manual fulfilment', done => {
    adminUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[10].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        assert.equal(res.body.total_discounts, 0)
        assert.equal(res.body.pricing_overrides.length, 0)
        assert.equal(res.body.total_overrides, 0)
        assert.equal(res.body.total_due, 100000)
        done(err)
      })
  })

  it('should checkout and item should be pending payment', (done) => {
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
        assert.equal(res.body.order.closed_at, null)

        // Discounts
        assert.equal(res.body.order.discounted_lines.length, 0)

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[10].price)
        assert.equal(res.body.order.subtotal_price, shopProducts[10].price)
        assert.equal(res.body.order.total_price, shopProducts[10].price)
        assert.equal(res.body.order.total_due, shopProducts[10].price)
        assert.equal(res.body.order.total_discounts, 0)
        assert.equal(res.body.order.total_captured, 0)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[10].price)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[10].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[10].price)
        assert.equal(res.body.order.order_items[0].total_discounts, 0)

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
        assert.equal(res.body.order.total_pending, shopProducts[10].price)
        assert.equal(res.body.order.total_authorized, 0)
        assert.equal(res.body.order.total_voided, 0)
        assert.equal(res.body.order.total_cancelled, 0)
        assert.equal(res.body.order.total_refunds, 0)
        assert.equal(res.body.order.total_captured, 0)

        // Events: Removed from the default query
        // assert.equal(res.body.order.events.length, 4)
        // res.body.order.events.forEach(event => {
        //   assert.equal(event.object_id, orderID)
        // })

        done(err)
      })
  })
  it('should authorize pending transaction by id', (done) => {
    adminUser
      .post(`/order/${orderID}/authorize`)
      .send([{
        transaction: transactionID
      }])
      .expect(200)
      .end((err, res) => {

        assert.ok(res.body.id)
        assert.ok(res.body.token)
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.payment_kind, 'manual')
        assert.equal(res.body.transaction_kind, 'authorize')
        assert.equal(res.body.fulfillment_kind, 'immediate')

        assert.equal(res.body.currency, 'USD')
        assert.equal(res.body.source_name, 'api')
        assert.equal(res.body.processing_method, 'checkout')
        assert.equal(res.body.financial_status, 'authorized')

        // This is a digital good
        assert.equal(res.body.fulfillment_status, 'pending')
        assert.equal(res.body.status, 'open')
        assert.equal(res.body.closed_at, null)

        // Discounts
        assert.equal(res.body.discounted_lines.length, 0)

        // Pricing
        assert.equal(res.body.total_line_items_price, shopProducts[10].price)
        assert.equal(res.body.subtotal_price, shopProducts[10].price)
        assert.equal(res.body.total_price, shopProducts[10].price)
        assert.equal(res.body.total_due, shopProducts[10].price)
        assert.equal(res.body.total_discounts, 0)

        // Order Items
        assert.equal(res.body.order_items.length, 1)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.order_items[0].price, shopProducts[10].price)
        assert.equal(res.body.order_items[0].price_per_unit, shopProducts[10].price)
        assert.equal(res.body.order_items[0].calculated_price, shopProducts[10].price)
        assert.equal(res.body.order_items[0].total_discounts, 0)

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
          assert.equal(transaction.status, 'success')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.total_pending, 0)
        assert.equal(res.body.total_authorized, shopProducts[10].price)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_cancelled, 0)
        assert.equal(res.body.total_captured, 0)
        assert.equal(res.body.total_refunds, 0)

        done(err)
      })
  })
  it('should capture pending transaction by id', (done) => {
    adminUser
      .post(`/order/${orderID}/capture`)
      .send([{
        transaction: transactionID
      }])
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        assert.ok(res.body.token)
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.payment_kind, 'manual')
        assert.equal(res.body.transaction_kind, 'authorize')
        assert.equal(res.body.fulfillment_kind, 'immediate')

        assert.equal(res.body.currency, 'USD')
        assert.equal(res.body.source_name, 'api')
        assert.equal(res.body.processing_method, 'checkout')
        assert.equal(res.body.financial_status, 'paid')

        // This is a digital good
        assert.equal(res.body.fulfillment_status, 'fulfilled')
        assert.equal(res.body.status, 'closed')
        assert.equal(_.isString(res.body.closed_at), true)

        // Discounts
        assert.equal(res.body.discounted_lines.length, 0)

        // Pricing
        assert.equal(res.body.total_line_items_price, shopProducts[10].price)
        assert.equal(res.body.subtotal_price, shopProducts[10].price)
        assert.equal(res.body.total_price, shopProducts[10].price)
        assert.equal(res.body.total_due, 0)
        assert.equal(res.body.total_discounts, 0)

        // Order Items
        assert.equal(res.body.order_items.length, 1)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.order_items[0].price, shopProducts[10].price)
        assert.equal(res.body.order_items[0].price_per_unit, shopProducts[10].price)
        assert.equal(res.body.order_items[0].calculated_price, shopProducts[10].price)
        assert.equal(res.body.order_items[0].total_discounts, 0)

        res.body.order_items.forEach(item => {
          assert.equal(item.order_id, orderID)
          assert.equal(item.fulfillment_status, 'fulfilled')
          assert.equal(item.fulfillment_id, res.body.fulfillments[0].id)
        })

        // Fulfillment
        assert.equal(res.body.fulfillments.length, 1)
        res.body.fulfillments.forEach(fulfillment => {
          assert.equal(fulfillment.status, 'fulfilled')
          assert.equal(fulfillment.order_id, orderID)
        })
        assert.equal(res.body.total_pending_fulfillments, 0)
        assert.equal(res.body.total_sent_fulfillments, 0)
        assert.equal(res.body.total_fulfilled_fulfillments, 1)
        assert.equal(res.body.total_partial_fulfillments, 0)
        assert.equal(res.body.total_cancelled_fulfillments, 0)

        // Transactions
        assert.equal(res.body.transactions.length, 1)
        transactionID = res.body.transactions[0].id
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'capture')
          assert.equal(transaction.status, 'success')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.total_pending, 0)
        assert.equal(res.body.total_authorized, 0)
        assert.equal(res.body.total_voided, 0)
        assert.equal(res.body.total_cancelled, 0)
        assert.equal(res.body.total_captured, shopProducts[10].price)
        assert.equal(res.body.total_refunds, 0)

        done(err)
      })
  })
})
