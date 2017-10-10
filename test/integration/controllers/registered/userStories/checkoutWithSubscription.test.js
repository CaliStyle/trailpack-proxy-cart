'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Registered User Checkout With Subscription', () => {
  let registeredUser, userID, customerID, cartToken, orderedCartToken, newCartToken, resetCartToken, shopID,
    shopProducts, orderID, orderToken, subscriptionID

  before((done) => {
    shopID = global.app.shopID
    shopProducts = global.app.shopProducts

    registeredUser = supertest.agent(global.app.packs.express.server)

    registeredUser.post('/auth/local/register')
      .send({
        email: 'checkoutwithsubscription@example.com',
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
        handle: 'checkout-with-subscription-test',
        title: 'Checkout with Subscription test',
        body: '# Discount that excludes product types of subscription',
        published: true,
        sort_order: 'price-desc',
        discount_type: 'fixed',
        discount_scope: 'global',
        discount_rate: 100,
        primary_purpose: 'discount',
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
  it('should add subscription product to cart with customer collection discount ignored for product type', done => {
    registeredUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            // Subscription with no discount and is a digital item.
            product_id: shopProducts[5].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        // Cart
        assert.equal(res.body.has_shipping, false)
        // TODO taxes
        // assert.equal(res.body.has_taxes, false)
        assert.equal(res.body.has_subscription, true)

        // Line Items
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[5].id)
        assert.equal(res.body.line_items[0].price, shopProducts[5].price)
        assert.equal(res.body.line_items[0].calculated_price, shopProducts[5].price)
        assert.equal(res.body.line_items[0].total_discounts, 0)

        // Discounts
        assert.equal(res.body.discounted_lines.length, 0)

        // Pricing
        assert.equal(res.body.total_line_items_price, shopProducts[5].price)
        assert.equal(res.body.subtotal_price, shopProducts[5].price)
        assert.equal(res.body.total_price, shopProducts[5].price) // TODO Is this right?!
        assert.equal(res.body.total_due, shopProducts[5].price)
        assert.equal(res.body.total_discounts, 0)

        done(err)
      })
  })

  // TODO refactor once we have base shipping and taxes
  it('should checkout with customer collection discounted items ignored for product type and create subscription', (done) => {
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

        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.equal(res.body.order.financial_status, 'paid')

        // This is a digital good, so it's fulfilled and closed
        assert.equal(res.body.order.fulfillment_status, 'fulfilled')
        assert.equal(res.body.order.status, 'closed')
        assert.equal(_.isString(res.body.order.closed_at), true)

        // Discounts
        assert.equal(res.body.order.discounted_lines.length, 0)

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[5].price)
        assert.equal(res.body.order.subtotal_price, shopProducts[5].price)
        assert.equal(res.body.order.total_price, shopProducts[5].price)
        assert.equal(res.body.order.total_due, 0)
        assert.equal(res.body.order.total_discounts, 0)
        assert.equal(res.body.order.total_captured, shopProducts[5].price)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[5].price)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[5].price)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[5].price)
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

  it('should get session customer subscriptions', done => {
    registeredUser
      .get('/customer/subscriptions')
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

        assert.equal(parseInt(res.headers['x-pagination-total']), 1)
        assert.equal(parseInt(res.headers['x-pagination-offset']), 0)
        assert.equal(parseInt(res.headers['x-pagination-limit']), 10)
        assert.equal(parseInt(res.headers['x-pagination-page']), 1)
        assert.equal(parseInt(res.headers['x-pagination-pages']), 1)

        subscriptionID = res.body[0].id
        assert.equal(res.body.length, 1)
        done(err)
      })
  })
  it('should get created subscription', done => {
    registeredUser
      .get(`/customer/subscription/${ subscriptionID }`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, subscriptionID)
        done(err)
      })
  })
  it('should cancel created subscription', done => {
    registeredUser
      .post(`/customer/subscription/${ subscriptionID }/cancel`)
      .send({
        reason: 'customer'
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, subscriptionID)
        assert.equal(res.body.active, false)
        assert.equal(res.body.cancel_reason, 'customer')
        assert.ok(res.body.cancelled_at)
        assert.ok(res.body.renews_on)
        done(err)
      })
  })
  it('should activate created subscription', done => {
    registeredUser
      .post(`/customer/subscription/${ subscriptionID }/activate`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, subscriptionID)
        assert.equal(res.body.active, true)
        assert.equal(res.body.cancel_reason, null)
        assert.equal(res.body.cancelled_at, null)
        done(err)
      })
  })
  it('should update created subscription', done => {
    registeredUser
      .post(`/customer/subscription/${ subscriptionID }`)
      .send({
        interval: 2,
        unit: 'm'
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, subscriptionID)
        assert.ok(res.body.token)
        assert.equal(res.body.active, true)
        assert.equal(res.body.interval, 2)
        assert.equal(res.body.unit, 'm')
        assert.ok(res.body.renews_on)
        assert.ok(res.body.renewed_at)
        assert.ok(res.body.line_items)
        assert.equal(res.body.cancelled, false)
        done(err)
      })
  })
  it('should activate subscription by id', done => {
    registeredUser
      .post(`/customer/subscription/${ subscriptionID }/deactivate`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, subscriptionID)
        assert.equal(res.body.active, false)
        assert.equal(res.body.cancel_reason, null)
        assert.equal(res.body.cancelled_at, null)
        done(err)
      })
  })
  it('should reactivate created subscription', done => {
    registeredUser
      .post(`/customer/subscription/${ subscriptionID }/activate`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, subscriptionID)
        assert.equal(res.body.active, true)
        assert.equal(res.body.cancel_reason, null)
        assert.equal(res.body.cancelled_at, null)
        done(err)
      })
  })

  it('should renew created subscription', done => {
    global.app.services.SubscriptionService.renew(subscriptionID)
      .then(body => {
        // ORDER
        const orderID = body.order.id
        assert.ok(body.order.id)
        assert.ok(body.order.token)
        assert.equal(body.order.financial_status, 'paid')
        assert.equal(body.order.currency, 'USD')
        assert.equal(body.order.source_name, 'api')
        assert.equal(body.order.processing_method, 'subscription')
        assert.equal(body.order.subtotal_price, shopProducts[5].price)
        assert.equal(body.order.total_price, shopProducts[5].price)
        assert.equal(body.order.total_discounts, 0)
        assert.equal(body.order.discounted_lines.length, 0)
        assert.equal(body.order.total_due, 0)

        assert.equal(body.order.order_items.length, 1)

        assert.equal(body.order.order_items[0].order_id, orderID)
        assert.ok(body.order.order_items[0].fulfillment_id)
        assert.equal(body.order.order_items[0].fulfillment_status, 'fulfilled')
        assert.equal(body.order.order_items[0].fulfillment_service, 'manual')
        assert.equal(body.order.order_items[0].product_id, shopProducts[5].id)
        assert.equal(body.order.order_items[0].price, shopProducts[5].price)
        assert.equal(body.order.order_items[0].total_discounts, 0)
        assert.equal(body.order.order_items[0].calculated_price, shopProducts[5].price)
        assert.equal(body.order.order_items[0].product_id, shopProducts[5].id)

        // Transactions
        assert.equal(body.order.transactions.length, 1)
        assert.equal(body.order.transactions[0].kind, 'sale')
        assert.equal(body.order.transactions[0].status, 'success')
        assert.equal(body.order.transactions[0].source_name, 'web')
        assert.equal(body.order.transactions[0].order_id, orderID)

        // Events
        // assert.equal(body.order.events.length, 4)
        // assert.equal(body.order.events[0].object_id, orderID)
        // assert.equal(body.order.events[1].object_id, orderID)
        // assert.equal(body.order.events[2].object_id, orderID)
        // assert.equal(body.order.events[3].object_id, orderID)
        // body.order.events.forEach(event => {
        //   assert.equal(event.object_id, orderID)
        // })

        // Subscription
        assert.ok(body.subscription.id)
        assert.equal(body.subscription.total_renewals, 1)

        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })
})
