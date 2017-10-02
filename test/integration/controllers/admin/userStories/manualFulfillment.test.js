'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Manual Fulfillment', () => {
  let adminUser, userID, customerID, cartID, shopID, shopProducts, orderID, fulfillmentID

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
            product_id: shopProducts[9].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        // console.log('User Story', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.total_discounts, 0)
        assert.equal(res.body.pricing_overrides.length, 0)
        assert.equal(res.body.total_overrides, 0)
        assert.equal(res.body.total_due, 100000)
        done(err)
      })
  })

  it('should checkout and item should be pending fulfillment', (done) => {
    adminUser
      .post('/cart/checkout')
      .send({
        payment_kind: 'immediate',
        transaction_kind: 'sale',
        payment_details: [
          {
            gateway: 'payment_processor',
            gateway_token: '123'
          }
        ],
        fulfillment_kind: 'manual'
      })
      .expect(200)
      .end((err, res) => {

        orderID = res.body.order.id

        assert.ok(res.body.order.id)
        assert.ok(res.body.order.token)
        assert.equal(res.body.order.customer_id, customerID)
        assert.equal(res.body.order.payment_kind, 'immediate')
        assert.equal(res.body.order.transaction_kind, 'sale')
        assert.equal(res.body.order.fulfillment_kind, 'manual')
        assert.equal(res.body.order.financial_status, 'paid')

        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')

        // This is a digital good
        assert.equal(res.body.order.fulfillment_status, 'pending')
        assert.equal(res.body.order.status, 'open')
        assert.equal(res.body.order.closed_at, null)

        // Discounts
        assert.equal(res.body.order.discounted_lines.length, 0)

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[9].price)
        assert.equal(res.body.order.subtotal_price, shopProducts[9].price)
        assert.equal(res.body.order.total_price, shopProducts[9].price)
        assert.equal(res.body.order.total_due, 0)
        assert.equal(res.body.order.total_discounts, 0)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[9].price)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[9].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[9].price)
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
        assert.equal(res.body.order.total_fulfilled_fulfillments, 0)
        assert.equal(res.body.order.total_sent_fulfillments, 0)
        assert.equal(res.body.order.total_partial_fulfillments, 0)
        assert.equal(res.body.order.total_pending_fulfillments, 1)

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        res.body.order.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'sale')
          assert.equal(transaction.status, 'success')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.order.total_captured, shopProducts[9].price)
        assert.equal(res.body.order.total_authorized, 0)
        assert.equal(res.body.order.total_voided, 0)
        assert.equal(res.body.order.total_pending, 0)
        assert.equal(res.body.order.total_cancelled, 0)
        assert.equal(res.body.order.total_refunds, 0)

        // Events: Removed from the default query
        // assert.equal(res.body.order.events.length, 4)
        // res.body.order.events.forEach(event => {
        //   assert.equal(event.object_id, orderID)
        // })

        done(err)
      })
  })
  it('should fulfill pending fulfillment by id', (done) => {
    adminUser
      .post(`/order/${orderID}/send`)
      .send([{
        fulfillment: fulfillmentID
      }])
      .expect(200)
      .end((err, res) => {
        console.log('user story',res.body)

        done(err)
      })
  })
})
