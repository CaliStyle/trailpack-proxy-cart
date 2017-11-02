'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const qs = require('qs')
const _ = require('lodash')

describe('Admin User CartController', () => {
  let adminUser, userID, customerID, cartID, orderedCartID, newCartID, resetCartID, shopID, shopProducts, orderID, totalSpent

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

        if (err) {
          return done(err)
        }

        adminUser.get('/customer')
          .expect(200)
          .end((err, res) => {
            assert.equal(customerID, res.body.id)
            totalSpent = res.body.total_spent
            console.log('total spent', totalSpent)
            done(err)
          })
      })
  })
  it('should exist', () => {
    assert(global.app.api.controllers['CartController'])
  })
  it('should create a cart with no items and a shipping address', (done) => {
    adminUser
      .post('/cart')
      .send({
        shipping_address: {
          first_name: 'Scotty',
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
        assert.ok(res.body.id)
        cartID = res.body.id
        assert.equal(res.body.total_items, 0)
        assert.equal(res.body.shipping_address.first_name, 'Scotty')
        assert.equal(res.body.shipping_address.last_name, 'W')
        assert.equal(res.body.shipping_address.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.shipping_address.address_2, null)
        assert.equal(res.body.shipping_address.address_3, null)
        assert.equal(res.body.shipping_address.company, 'Shipping Department')
        assert.equal(res.body.shipping_address.city, 'Washington')
        assert.equal(res.body.shipping_address.phone, null)
        assert.equal(res.body.shipping_address.province_code, 'DC')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.postal_code, '20500')
        assert.equal(res.body.customer_id, customerID)
        done(err)
      })
  })
  it('should update a cart with no items and a shipping address', (done) => {
    adminUser
      .put('/cart')
      .send({
        shipping_address: {
          first_name: 'Scottie',
          last_name: 'W',
          address_1: '1600 Pennsylvania Ave NW',
          address_2: '',
          company: 'Billing Department',
          city: 'Washington',
          phone: '',
          province_code: 'DC',
          country_code: 'US',
          postal_code: '20500'
        }
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.total_items, 0)
        assert.equal(res.body.shipping_address.first_name, 'Scottie')
        assert.equal(res.body.shipping_address.last_name, 'W')
        assert.equal(res.body.shipping_address.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.shipping_address.address_2, null)
        assert.equal(res.body.shipping_address.address_3, null)
        assert.equal(res.body.shipping_address.company, 'Billing Department')
        assert.equal(res.body.shipping_address.city, 'Washington')
        assert.equal(res.body.shipping_address.phone, null)
        assert.equal(res.body.shipping_address.province_code, 'DC')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.postal_code, '20500')
        done(err)
      })
  })
  it('should get a cart with no items and a shipping address', (done) => {
    adminUser
      .get('/cart')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.total_items, 0)
        assert.equal(res.body.shipping_address.first_name, 'Scottie')
        assert.equal(res.body.shipping_address.last_name, 'W')
        assert.equal(res.body.shipping_address.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.shipping_address.address_2, null)
        assert.equal(res.body.shipping_address.address_3, null)
        assert.equal(res.body.shipping_address.company, 'Billing Department')
        assert.equal(res.body.shipping_address.city, 'Washington')
        assert.equal(res.body.shipping_address.phone, null)
        assert.equal(res.body.shipping_address.province_code, 'DC')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.postal_code, '20500')
        done(err)
      })
  })
  it('should create a cart with default item and address', (done) => {
    adminUser
      .post('/cart')
      .send({
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
        },
        line_items: [
          {
            product_id: shopProducts[1].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        cartID = res.body.id
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[1].id)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.status, 'open')
        assert.equal(res.body.currency, 'USD')
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(res.body.total_line_items_price, 100000)
        assert.equal(res.body.total_price, 100000)
        assert.equal(res.body.total_due, 100000)
        assert.equal(res.body.total_shipping, 0)
        assert.equal(res.body.total_tax, 0)
        // SQLite allows a float here and Postgres does not
        //assert.equal(res.body.total_weight, 9072)
        assert.equal(_.isNumber(res.body.total_weight), true)
        assert.equal(res.body.has_shipping, true)

        // TODO
        // assert.equal(res.body.has_taxes, true)

        // Address
        assert.equal(res.body.shipping_address.first_name, 'Scottie')
        assert.equal(res.body.shipping_address.last_name, 'W')
        assert.equal(res.body.shipping_address.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.shipping_address.address_2, null)
        assert.equal(res.body.shipping_address.address_3, null)
        assert.equal(res.body.shipping_address.company, 'Shipping Department')
        assert.equal(res.body.shipping_address.city, 'Washington')
        assert.equal(res.body.shipping_address.phone, null)
        assert.equal(res.body.shipping_address.province_code, 'DC')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.postal_code, '20500')

        done(err)
      })
  })
  it('should make addItems post request with just a product_id', (done) => {
    adminUser
      .post('/cart/addItems')
      .send([
        {
          product_id: shopProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.status, 'open')
        assert.equal(res.body.line_items.length, 2)
        assert.equal(res.body.line_items[1].product_id, shopProducts[0].id)

        assert.equal(res.body.total_line_items_price, 200000)
        assert.equal(res.body.subtotal_price, 200000)
        assert.equal(res.body.total_items, 2)

        assert.equal(_.isNumber(res.body.total_weight), true)
        assert.equal(res.body.has_shipping, true)
        // TODO
        // assert.equal(res.body.has_taxes, true)
        done(err)
      })
  })
  it('should make removeItems post request with just a product_id', (done) => {
    adminUser
      .post('/cart/removeItems')
      .send([
        {
          product_id: shopProducts[1].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.status, 'open')
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[0].id)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.total_line_items_price, 100000)
        assert.equal(res.body.subtotal_price, 100000)
        assert.equal(_.isNumber(res.body.total_weight), true)
        assert.equal(res.body.has_shipping, true)
        done(err)
      })
  })
  it('should make clearCart post request', (done) => {
    adminUser
      .post('/cart/clear')
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.status, 'open')
        assert.equal(res.body.line_items.length, 0)
        assert.equal(res.body.total_items, 0)
        assert.equal(res.body.total_line_items_price, 0)
        assert.equal(res.body.subtotal_price, 0)
        assert.equal(_.isNumber(res.body.total_weight), true)
        assert.equal(res.body.has_shipping, false)
        done(err)
      })
  })
  it('should make addItems post for multiple items', (done) => {
    adminUser
      .post('/cart/addItems')
      .send([
        {
          product_variant_id: shopProducts[0].variants[1].id
        },
        {
          product_id: shopProducts[1].id,
          quantity: 2
        },
        {
          variant_id: shopProducts[0].variants[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.total_items, 4)
        assert.equal(res.body.line_items.length, 3)
        assert.equal(_.isNumber(res.body.total_weight), true)
        assert.equal(res.body.has_shipping, true)

        // TODO
        // assert.equal(res.body.has_taxes, true)

        // Line Items
        assert.equal(res.body.line_items[0].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[0].variant_id, shopProducts[0].variants[1].id)
        assert.equal(res.body.line_items[0].quantity, 1)
        assert.equal(res.body.line_items[0].sku, shopProducts[0].variants[1].sku)
        assert.equal(res.body.line_items[0].title, shopProducts[0].title)
        assert.equal(res.body.line_items[0].variant_title, shopProducts[0].variants[1].title)
        assert.equal(res.body.line_items[0].name, `${shopProducts[0].title} - ${shopProducts[0].variants[1].title}`)
        assert.equal(res.body.line_items[0].price, shopProducts[0].variants[1].price)
        assert.equal(res.body.line_items[0].weight, shopProducts[0].variants[1].weight)
        assert.equal(res.body.line_items[0].weight_unit, shopProducts[0].variants[1].weight_unit)
        assert.equal(res.body.line_items[0].grams, 9071.847392)
        assert.equal(res.body.line_items[0].images.length, 1)

        assert.equal(res.body.line_items[1].product_id, shopProducts[1].id)
        assert.equal(res.body.line_items[1].variant_id, shopProducts[1].variants[0].id)
        assert.equal(res.body.line_items[1].quantity, 2)
        assert.equal(res.body.line_items[1].sku, shopProducts[1].variants[0].sku)
        assert.equal(res.body.line_items[1].title, shopProducts[1].title)
        assert.equal(res.body.line_items[1].variant_title, shopProducts[1].variants[0].title)
        assert.equal(res.body.line_items[1].name, `${shopProducts[1].title}`) // same title
        assert.equal(res.body.line_items[1].price, shopProducts[1].variants[0].price * 2)
        assert.equal(res.body.line_items[1].weight, shopProducts[1].variants[0].weight * 2)
        assert.equal(res.body.line_items[1].weight_unit, shopProducts[1].variants[0].weight_unit)
        assert.equal(res.body.line_items[1].grams, (9071.847392 * 2))

        assert.equal(res.body.line_items[2].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[2].variant_id, shopProducts[0].variants[0].id)
        assert.equal(res.body.line_items[2].quantity, 1)
        assert.equal(res.body.line_items[2].sku, shopProducts[0].variants[0].sku)
        assert.equal(res.body.line_items[2].title, shopProducts[0].title)
        assert.equal(res.body.line_items[2].variant_title, shopProducts[0].variants[0].title)
        assert.equal(res.body.line_items[2].name, shopProducts[0].variants[0].title)
        assert.equal(res.body.line_items[2].price, shopProducts[0].variants[0].price)
        assert.equal(res.body.line_items[2].weight, shopProducts[0].variants[0].weight)
        assert.equal(res.body.line_items[2].weight_unit, shopProducts[0].variants[0].weight_unit)
        assert.equal(res.body.line_items[2].grams, 9071.847392)
        done(err)
      })
  })
  // TODO
  it.skip('should make addCoupon request', (done) => {
    adminUser
      .post('/cart/addCoupon')
      .send({

      })
      .expect(200)
      .end((err, res) => {
        // assert.equal(res.body.id, cartID)
        done(err)
      })
  })
  // TODO
  it.skip('should make addDiscount request', (done) => {
    adminUser
      .post('/cart/addDiscount')
      .send({

      })
      .expect(200)
      .end((err, res) => {
        // assert.equal(res.body.id, cartID)
        done(err)
      })
  })
  it('should make checkout post request', (done) => {
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

        assert.equal(res.body.order.financial_status, 'paid')
        assert.equal(res.body.order.fulfillment_status, 'sent')
        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.ok(res.body.order.subtotal_price)
        assert.equal(res.body.order.status, 'open')
        assert.equal(res.body.order.closed_at, null)

        // Order Items
        assert.equal(res.body.order.order_items.length, 3)
        assert.equal(res.body.order.total_items, 4)
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
        assert.equal(res.body.order.shipping_address.address_2, null)
        assert.equal(res.body.order.shipping_address.address_3, null)
        assert.equal(res.body.order.shipping_address.company, 'Shipping Department')
        assert.equal(res.body.order.shipping_address.city, 'Washington')
        assert.equal(res.body.order.shipping_address.phone, null)
        assert.equal(res.body.order.shipping_address.province_code, 'DC')
        assert.equal(res.body.order.shipping_address.country_code, 'US')
        assert.equal(res.body.order.shipping_address.postal_code, '20500')

        // Cart: New Cart (old cart is retired)
        assert.equal(res.body.cart.status, 'open')
        assert.equal(res.body.cart.customer_id, customerID)
        orderedCartID = cartID
        newCartID = res.body.cart.id

        // Add total spent
        totalSpent = totalSpent + res.body.order.total_price

        done(err)
      })
  })
  it('should get session customer and total spent should be the total order', (done) => {
    adminUser
      .get('/customer')
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.total_spent, totalSpent)
        assert.equal(res.body.last_order_id, orderID)
        done(err)
      })
  })
  it('should get session checked out cart and status should be ordered', (done) => {
    adminUser
      .get(`/cart/${orderedCartID}`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderedCartID)
        assert.equal(res.body.status, 'ordered')
        done(err)
      })
  })
  it('should get session customer order by id', done => {
    adminUser
      .get(`/customer/order/${ orderID }`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, orderID)
        done(err)
      })
  })

  it('should initialize a new cart', (done) => {
    adminUser
      .post('/cart/init')
      .send({ })
      .expect(200)
      .end((err, res) => {
        resetCartID = res.body.id
        assert.ok(res.body.id)
        assert.equal(res.body.id, resetCartID)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })

  // This request is already logged into cart, but just to prove they can
  it('should login to cart', done => {
    adminUser
      .post('/cart/login')
      .send({ })
      .expect(200)
      .end((err, res) => {
        console.log('BROKE', err, res.body)
        assert.equal(res.body.customer_id, customerID)
        assert.ok(res.body.id)
        assert.equal(res.body.id, resetCartID)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })

  it('should switch cart', done => {
    adminUser
      .post(`/cart/${newCartID}/switch`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        assert.equal(res.body.id, newCartID)
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.line_items.length, 0)
        assert.equal(res.body.subtotal_price, 0)
        done(err)
      })
  })

  it('should count all carts', (done) => {
    adminUser
      .get('/cart/count')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.carts)
        assert.equal(_.isNumber(res.body.carts), true)
        done(err)
      })
  })
  it('should get all carts', (done) => {
    adminUser
      .get('/carts')
      .query(qs.stringify({
        sort: [['updated_at','DESC'],['created_at','DESC']]
      }))
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)
        assert.ok(res.body)
        done(err)
      })
  })
})
