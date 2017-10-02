'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Registered User Checkout With Collection Discount', () => {
  let registeredUser, userID, customerID, cartToken, orderedCartToken, newCartToken, resetCartToken, shopID,
    shopProducts, orderID, orderToken

  before((done) => {
    shopID = global.app.shopID
    shopProducts = global.app.shopProducts

    registeredUser = supertest.agent(global.app.packs.express.server)

    registeredUser.post('/auth/local/register')
      .send({
        email: 'checkoutwithproductdiscount@example.com',
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
  // TODO refactor once we add in base shipping and taxes
  it('should add product with collection discount', done => {
    registeredUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            // is a digital item with a collection discount.
            product_id: shopProducts[8].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        console.log('User Story', res.body.discounted_lines)
        // Cart
        assert.equal(res.body.has_shipping, false)
        // TODO taxes
        // assert.equal(res.body.has_taxes, false)
        assert.equal(res.body.has_subscription, false)

        // Line Items
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[8].id)
        assert.equal(res.body.line_items[0].price, shopProducts[8].price)
        assert.equal(res.body.line_items[0].calculated_price, shopProducts[8].price - 100)
        assert.equal(res.body.line_items[0].total_discounts, 100)

        // Discounts
        assert.equal(res.body.discounted_lines.length, 1)
        assert.equal(res.body.discounted_lines[0].name, 'Product with discount Collection test')
        assert.equal(res.body.discounted_lines[0].price, 100)
        assert.equal(res.body.discounted_lines[0].scope, 'individual')
        assert.equal(res.body.discounted_lines[0].rate, 100)
        assert.equal(res.body.discounted_lines[0].type, 'fixed')

        // Pricing
        assert.equal(res.body.total_line_items_price, shopProducts[8].price)
        assert.equal(res.body.subtotal_price, shopProducts[8].price)
        assert.equal(res.body.total_price, shopProducts[8].price) // TODO Is this right?!
        assert.equal(res.body.total_due, shopProducts[8].price - 100)
        assert.equal(res.body.total_discounts, 100)

        done(err)
      })
  })

  // TODO refactor once we have base shipping and taxes
  it('should checkout with product collection discount', (done) => {
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

        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.equal(res.body.order.financial_status, 'paid')

        // This is a digital good, so it's fulfilled and closed
        assert.equal(res.body.order.fulfillment_status, 'fulfilled')
        assert.equal(res.body.order.status, 'closed')
        assert.equal(_.isString(res.body.order.closed_at), true)

        // Discounts
        assert.equal(res.body.order.discounted_lines.length, 1)

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[8].price)
        assert.equal(res.body.order.subtotal_price, shopProducts[8].price)
        assert.equal(res.body.order.total_price, shopProducts[8].price - 100)
        assert.equal(res.body.order.total_due, 0)
        assert.equal(res.body.order.total_discounts, 100)
        assert.equal(res.body.order.total_captured, shopProducts[8].price - 100)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[8].price)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[8].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[8].price - 100)
        assert.equal(res.body.order.order_items[0].total_discounts, 100)

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

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        res.body.order.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'sale')
          assert.equal(transaction.status, 'success')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })

        // Events: Removed from the default query
        // assert.equal(res.body.order.events.length, 4)
        // res.body.order.events.forEach(event => {
        //   assert.equal(event.object_id, orderID)
        // })

        done(err)
      })
  })
})
