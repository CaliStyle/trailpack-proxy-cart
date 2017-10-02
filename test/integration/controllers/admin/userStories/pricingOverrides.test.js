'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Pricing Override', () => {
  let adminUser, userID, customerID, cartID, orderedCartID, newCartID, resetCartID, shopID, shopProducts, orderID

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
        done(err)
      })
  })

  it('should initialize a new cart', (done) => {
    adminUser
      .post('/cart/init')
      .send({ })
      .expect(200)
      .end((err, res) => {
        cartID = res.body.id
        assert.ok(res.body.id)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })

  it('It should create a pricing override for a cart', (done) => {
    adminUser
      .post(`/cart/${ cartID }/pricingOverrides`)
      .send([{
        name: 'Test Override',
        price: 100
      }])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.total_overrides, 100)
        assert.equal(res.body.pricing_overrides.length, 1)
        assert.equal(res.body.pricing_overrides[0].name, 'Test Override')
        assert.equal(res.body.pricing_overrides[0].price, 100)
        assert.equal(res.body.pricing_overrides[0].admin_id, userID)
        assert.equal(res.body.pricing_override_id, userID)
        done()
      })
  })

  it('It should override a pricing override for a cart', (done) => {
    adminUser
      .post(`/cart/${ cartID }/pricingOverrides`)
      .send([{
        name: 'Override Test Override',
        price: 1000
      }])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.total_overrides, 1000)
        assert.equal(res.body.pricing_overrides.length, 1)
        assert.equal(res.body.pricing_overrides[0].name, 'Override Test Override')
        assert.equal(res.body.pricing_overrides[0].price, 1000)
        assert.equal(res.body.pricing_overrides[0].admin_id, userID)
        assert.equal(res.body.pricing_override_id, userID)
        done()
      })
  })

  it('should add product to cart that accepts pricing overrides', done => {
    adminUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[6].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        // console.log('User Story', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.total_discounts, 0)
        assert.equal(res.body.pricing_overrides.length, 1)
        assert.equal(res.body.pricing_overrides[0].name, 'Override Test Override')
        assert.equal(res.body.pricing_overrides[0].price, 1000)
        assert.equal(res.body.pricing_overrides[0].admin_id, userID)
        assert.equal(res.body.pricing_override_id, userID)
        assert.equal(res.body.total_overrides, 1000)
        assert.equal(res.body.total_due, 99000)
        done(err)
      })
  })

  it('should checkout with pricing override', (done) => {
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
        fulfillment_kind: 'immediate',
        shipping_address: {
          first_name: 'Scottie',
          last_name: 'W',
          address_1: '1600 Pennsylvania Ave NW',
          address_2: '',
          company: 'Shipping Department',
          city: 'Washington',
          phone: '',
          province_code: 'DC',
          country_code: 'US',
          postal_code: '20500'
        }
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
        assert.equal(res.body.order.payment_kind, 'immediate')
        assert.equal(res.body.order.transaction_kind, 'sale')
        assert.equal(res.body.order.fulfillment_kind, 'immediate')

        // This is a digital good, so it's fulfilled and closed
        assert.equal(res.body.order.fulfillment_status, 'fulfilled')
        assert.equal(res.body.order.status, 'closed')
        assert.equal(_.isString(res.body.order.closed_at), true)

        // Discounts
        assert.equal(res.body.order.discounted_lines.length, 0)

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[6].price)
        assert.equal(res.body.order.subtotal_price, shopProducts[6].price)
        assert.equal(res.body.order.total_price, shopProducts[6].price - 1000) // TODO is this right?!
        assert.equal(res.body.order.total_due, 0)
        assert.equal(res.body.order.total_discounts, 0)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[6].price)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[6].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[6].price)
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
        assert.equal(res.body.order.total_fulfilled_fulfillments, 1)
        assert.equal(res.body.order.total_sent_fulfillments, 0)
        assert.equal(res.body.order.total_pending_fulfillments, 0)
        assert.equal(res.body.order.total_partial_fulfillments, 0)

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        res.body.order.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'sale')
          assert.equal(transaction.status, 'success')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.order.total_captured, shopProducts[6].price - 1000)
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
})
