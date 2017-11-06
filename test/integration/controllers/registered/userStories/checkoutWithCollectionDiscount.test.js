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
        email: 'checkoutwithcollectiondiscount@example.com',
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
  it('should add customer to discounted collection', (done) => {
    global.app.services.CollectionService
      .create({
        handle: 'checkout-with-collection-discount-test',
        title: 'Checkout with Collection Discount test',
        body: '# Discount that excludes product types of subscription',
        published: true,
        sort_order: 'price-desc',
        primary_purpose: 'discount',
        discount_type: 'rate',
        discount_scope: 'global',
        discount_rate: 100,
        discount_product_exclude: [
          'subscription'
        ]
      })
      .then(collection => {
        if (!collection) {
          const err = 'Collection not created'
          done(err)
        }
        return collection.addCustomer(customerID)
      })
      .then(customer => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  // TODO refactor once we add in base shipping and taxes
  it('should add products to cart with customer collection discount', done => {
    registeredUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[0].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        console.log('BROKE USER STORY',res.body)
        // Cart
        assert.equal(res.body.has_shipping, true)
        assert.equal(res.body.has_taxes, true)

        // Line Items
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[0].price, shopProducts[0].price)
        assert.equal(res.body.line_items[0].calculated_price, shopProducts[0].price - 100)
        assert.equal(res.body.line_items[0].total_discounts, 100)

        // Discounts
        assert.equal(res.body.discounted_lines.length, 1)
        assert.equal(res.body.discounted_lines[0].name, 'Checkout with Collection Discount test')
        assert.equal(res.body.discounted_lines[0].price, 100)
        assert.equal(res.body.discounted_lines[0].rate, 100)
        assert.equal(res.body.discounted_lines[0].type, 'rate')
        assert.equal(res.body.discounted_lines[0].scope, 'global')

        // Pricing
        assert.equal(res.body.total_line_items_price, shopProducts[0].price)
        assert.equal(res.body.subtotal_price, shopProducts[0].price)
        assert.equal(res.body.total_price, shopProducts[0].price) // TODO Is this right?!
        assert.equal(res.body.total_due, shopProducts[0].price - 100)
        assert.equal(res.body.total_discounts, 100)

        done(err)
      })
  })

  // TODO refactor once we have base shipping and taxes
  it('should checkout with customer collection discounted items', (done) => {
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

        assert.equal(res.body.order.financial_status, 'paid')
        assert.equal(res.body.order.fulfillment_status, 'sent')
        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.equal(res.body.order.status, 'open')
        assert.equal(res.body.order.closed_at, null)

        // Discounts
        assert.equal(res.body.order.discounted_lines.length, 1)
        assert.equal(res.body.order.discounted_lines[0].name, 'Checkout with Collection Discount test')
        assert.equal(res.body.order.discounted_lines[0].price, 100)
        assert.equal(res.body.order.discounted_lines[0].rate, 100)
        assert.equal(res.body.order.discounted_lines[0].type, 'rate')
        assert.equal(res.body.order.discounted_lines[0].scope, 'global')

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[0].price)
        assert.equal(res.body.order.subtotal_price, shopProducts[0].price)
        assert.equal(res.body.order.total_price, shopProducts[0].price - 100) // TODO Is this right?!
        assert.equal(res.body.order.total_due, 0)
        assert.equal(res.body.order.total_discounts, 100)
        assert.equal(res.body.order.total_captured, shopProducts[0].price - 100)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[0].price)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[0].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[0].price - 100)
        assert.equal(res.body.order.order_items[0].total_discounts, 100)

        res.body.order.order_items.forEach(item => {
          assert.equal(item.order_id, orderID)
          assert.equal(item.fulfillment_status, 'sent')
          assert.equal(item.fulfillment_id, res.body.order.fulfillments[0].id)
        })

        // Fulfillment
        assert.equal(res.body.order.fulfillments.length, 1)
        res.body.order.fulfillments.forEach(fulfillment => {
          assert.equal(fulfillment.status, 'sent')
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

        // Shipping Address
        assert.equal(res.body.order.shipping_address.first_name, 'Scottie')
        assert.equal(res.body.order.shipping_address.last_name, 'W')
        assert.equal(res.body.order.shipping_address.address_1, '1600 Pennsylvania Ave NW')
        // assert.equal(res.body.order.shipping_address.address_2, null)
        // assert.equal(res.body.order.shipping_address.address_3, null)
        assert.equal(res.body.order.shipping_address.company, 'Shipping Department')
        assert.equal(res.body.order.shipping_address.city, 'Washington')
        // assert.equal(res.body.order.shipping_address.phone, null)
        assert.equal(res.body.order.shipping_address.province_code, 'DC')
        assert.equal(res.body.order.shipping_address.country_code, 'US')
        assert.equal(res.body.order.shipping_address.postal_code, '20500')

        done(err)
      })
  })
})
