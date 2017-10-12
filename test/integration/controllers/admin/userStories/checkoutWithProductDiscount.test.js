'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Checkout with Product Discount', () => {
  let adminUser, userID, customerID, cartID, shopID, shopProducts, orderID, transactionID
  let discountService, discountID

  before((done) => {
    shopID = global.app.shopID
    shopProducts = global.app.shopProducts
    discountService = global.app.services.DiscountService
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
  it('should create a discount', done => {
    discountService.create({
      name: 'product with discount',
      description: 'product with discount',
      code: 'product-with-discount',
      discount_type: 'rate',
      discount_rate: 100,
      discount_status: 'enabled',
      applies_to_id: shopProducts[12].id,
      applies_to_model: 'product',
      applies_compound: false
    })
      .then(discount => {
        assert.ok(discount)
        discountID = discount.id
        assert.equal(discount.name, 'product with discount')
        assert.equal(discount.description, 'product with discount')
        assert.equal(discount.code, 'product-with-discount')
        assert.equal(discount.discount_type, 'rate')
        assert.equal(discount.discount_rate, 100)
        assert.equal(discount.status, 'enabled')
        assert.equal(discount.minimum_order_amount, 0)
        assert.equal(discount.usage_limit, 0)
        assert.equal(discount.applies_to_id, shopProducts[12].id)
        assert.equal(discount.applies_to_model, 'product')
        assert.equal(discount.applies_compound, false)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should add product to cart', done => {
    adminUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[12].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        console.log('user story', res.body)

        done(err)
      })
  })

  it('should checkout and item', (done) => {
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
        assert.equal(res.body.order.total_line_items_price, shopProducts[12].price)
        assert.equal(res.body.order.subtotal_price, shopProducts[12].price)
        assert.equal(res.body.order.total_price, shopProducts[12].price)
        assert.equal(res.body.order.total_due, 0)
        assert.equal(res.body.order.total_discounts, 0)
        assert.equal(res.body.order.total_captured, shopProducts[12].price)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[12].price)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[12].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[12].price)
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
        assert.equal(res.body.order.total_captured, shopProducts[12].price)

        // Events: Removed from the default query
        // assert.equal(res.body.order.events.length, 4)
        // res.body.order.events.forEach(event => {
        //   assert.equal(event.object_id, orderID)
        // })

        done(err)
      })
  })
})
