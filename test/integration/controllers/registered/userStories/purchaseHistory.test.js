'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Purchase History', () => {
  let registeredUser, userID, customerID, cartID, shopID, shopProducts, orderID, transactionID

  before((done) => {
    shopID = global.app.shopID
    shopProducts = global.app.shopProducts

    registeredUser = supertest.agent(global.app.packs.express.server)

    registeredUser.post('/auth/local/register')
      .send({
        email: 'purchasehistory@example.com',
        password: 'admin1234'
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.user.id)
        assert.ok(res.body.user.current_customer_id)
        userID = res.body.user.id
        customerID = res.body.user.current_customer_id
        done(err)
      })
  })
  it('should add product to cart', done => {
    registeredUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[11].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        done(err)
      })
  })

  it('should checkout and item', (done) => {
    registeredUser
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
        fulfillment_kind: 'immediate'
      })
      .expect(200)
      .end((err, res) => {
        orderID = res.body.order.id

        assert.ok(res.body.order.id)
        assert.ok(res.body.order.token)
        assert.equal(res.body.order.customer_id, customerID)
        assert.equal(res.body.order.payment_kind, 'immediate')
        assert.equal(res.body.order.transaction_kind, 'sale')
        assert.equal(res.body.order.fulfillment_kind, 'immediate')

        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.equal(res.body.order.financial_status, 'paid')

        // This is a digital good
        assert.equal(res.body.order.fulfillment_status, 'fulfilled')
        assert.equal(res.body.order.status, 'closed')
        assert.equal(_.isString(res.body.order.closed_at), true)

        // Discounts
        assert.equal(res.body.order.discounted_lines.length, 0)

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[11].price)
        assert.equal(res.body.order.subtotal_price, shopProducts[11].price)
        assert.equal(res.body.order.total_price, shopProducts[11].price)
        assert.equal(res.body.order.total_due, 0)
        assert.equal(res.body.order.total_discounts, 0)
        assert.equal(res.body.order.total_captured, shopProducts[11].price)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[11].price)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[11].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[11].price)
        assert.equal(res.body.order.order_items[0].total_discounts, 0)

        res.body.order.order_items.forEach(item => {
          assert.equal(item.order_id, orderID)
          assert.equal(item.fulfillment_status, 'fulfilled')
          assert.equal(item.fulfillment_id, res.body.order.fulfillments[0].id)
        })

        // Fulfillment
        assert.equal(res.body.order.fulfillments.length, 1)
        res.body.order.fulfillments.forEach(fulfillment => {
          assert.equal(fulfillment.status, 'fulfilled')
          assert.equal(fulfillment.order_id, orderID)
        })
        assert.equal(res.body.order.total_pending_fulfillments, 0)
        assert.equal(res.body.order.total_sent_fulfillments, 0)
        assert.equal(res.body.order.total_fulfilled_fulfillments, 1)
        assert.equal(res.body.order.total_partial_fulfillments, 0)

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        transactionID = res.body.order.transactions[0].id
        res.body.order.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'sale')
          assert.equal(transaction.status, 'success')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.order.total_pending, 0)
        assert.equal(res.body.order.total_authorized, 0)
        assert.equal(res.body.order.total_voided, 0)
        assert.equal(res.body.order.total_cancelled, 0)
        assert.equal(res.body.order.total_refunds, 0)
        assert.equal(res.body.order.total_captured, shopProducts[11].price)

        // Events: Removed from the default query
        // assert.equal(res.body.order.events.length, 4)
        // res.body.order.events.forEach(event => {
        //   assert.equal(event.object_id, orderID)
        // })

        done(err)
      })
  })
  it('should have purchase history with product', done => {
    registeredUser
      .get(`/product/handle/${shopProducts[11].handle}`)
      .expect(200)
      .end((err, res) => {

        assert.equal(res.body.has_purchase_history, true)
        assert.equal(res.body.is_subscribed, true)
        done(err)
      })
  })
})
