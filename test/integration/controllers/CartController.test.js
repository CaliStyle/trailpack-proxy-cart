'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
// const products = require('../../fixtures/products')
const customers = require('../../fixtures/customers')

describe('CartController', () => {
  let request
  let agent
  let cartID
  let customerID
  let orderID
  let shopID
  let shopProducts

  before((done) => {
    shopID = global.app.shopID
    shopProducts = global.app.shopProducts
    request = supertest('http://localhost:3000')
    agent = supertest.agent(global.app.packs.express.server)
    // Login as Admin
    agent
      .post('/auth/local')
      .set('Accept', 'application/json') //set header for this test
      .send({username: 'admin', password: 'admin1234'})
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.controllers['CartController'])
  })
  it('should create a cart with no items and a shipping address', (done) => {
    request
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
        assert.equal(res.body.shipping_address.address_2, '')
        assert.equal(res.body.shipping_address.company, 'Shipping Department')
        assert.equal(res.body.shipping_address.city, 'Washington')
        assert.equal(res.body.shipping_address.phone, '')
        assert.equal(res.body.shipping_address.province_code, 'DC')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.postal_code, '20500')
        done(err)
      })
  })
  it('should update a cart with no items and a shipping address', (done) => {
    request
      .post(`/cart/${cartID}`)
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
        }
      })
      .expect(200)
      .end((err, res) => {
        // console.log('BROKE',res.body)
        assert.ok(res.body.id)
        cartID = res.body.id
        assert.equal(res.body.total_items, 0)
        assert.equal(res.body.shipping_address.first_name, 'Scottie')
        assert.equal(res.body.shipping_address.last_name, 'W')
        assert.equal(res.body.shipping_address.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.shipping_address.address_2, '')
        assert.equal(res.body.shipping_address.company, 'Shipping Department')
        assert.equal(res.body.shipping_address.city, 'Washington')
        assert.equal(res.body.shipping_address.phone, '')
        assert.equal(res.body.shipping_address.province_code, 'DC')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.postal_code, '20500')
        done(err)
      })
  })
  it('should create a cart with default item', (done) => {
    request
      .post('/cart')
      .send({
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
        assert.equal(res.body.line_items.length, 1)
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
        assert.equal(res.body.has_shipping, true)

        // console.log('THIS CART', res.body)
        done(err)
      })
  })
  it('should add cart to customer on creation',(done) => {
    const customer = customers[0]
    customer.cart = cartID
    request
      .post('/customer')
      .send(customer)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS CUSTOMER',res.body)
        customerID = res.body.id
        assert.equal(res.body.default_cart.id, cartID)
        // assert.equal(res.body.carts.length, 1)
        done(err)
      })
  })
  it('should should get the created customer with cart',(done) => {
    request
      .get(`/customer/${customerID}`)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS CUSTOMER', res.body)
        assert.equal(res.body.id, customerID)
        assert.equal(res.body.default_cart.id, cartID)
        // TODO add back in Carts
        // assert.equal(res.body.carts.length, 1)
        done(err)
      })
  })
  it('should make addItems post request with just a product_id', (done) => {
    request
      .post(`/cart/${cartID}/addItems`)
      .send([
        {
          product_id: shopProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        // console.log('THIS CART',res.body)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.status, 'open')
        assert.equal(res.body.line_items.length, 2)
        assert.equal(res.body.line_items[1].product_id, shopProducts[0].id)

        // Line Items
        assert.equal(res.body.line_items[1].grams, 9071.847392)

        assert.equal(res.body.total_line_items_price, 200000)
        assert.equal(res.body.subtotal_price, 200000)
        assert.equal(res.body.total_items, 2)
        done(err)
      })
  })

  it('should make addItems post request with line_items as array in object and increment quantity', (done) => {
    request
      .post(`/cart/${cartID}/addItems`)
      .send({
        line_items: [
          {
            product_id: shopProducts[0].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 2)
        assert.equal(res.body.line_items[1].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[1].quantity, 2)
        assert.equal(res.body.total_line_items_price, 300000)
        assert.equal(res.body.total_items, 3)
        done(err)
      })
  })

  it('should make removeItems post and decrease the quantity', (done) => {
    request
      .post(`/cart/${cartID}/removeItems`)
      .send([
        {
          product_id: shopProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 2)
        assert.equal(res.body.line_items[1].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[1].quantity, 1)
        assert.equal(res.body.total_line_items_price, 200000)
        assert.equal(res.body.total_items, 2)
        done(err)
      })
  })

  it('should make removeItems post request with just a product_id', (done) => {
    request
      .post(`/cart/${cartID}/removeItems`)
      .send([
        {
          product_id: shopProducts[0].id
        },
        {
          product_id: shopProducts[1].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 0)
        assert.equal(res.body.total_items, 0)
        done(err)
      })
  })

  it('should make clearCart post request', (done) => {
    request
      .post(`/cart/${cartID}/clear`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 0)
        assert.equal(res.body.total_items, 0)
        done(err)
      })
  })
  it('should make addItems post for multiple items', (done) => {
    request
      .post(`/cart/${cartID}/addItems`)
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
        // console.log('THIS CART', res.body)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.total_items, 4)
        assert.equal(res.body.line_items.length, 3)
        assert.equal(res.body.line_items[0].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[0].variant_id, shopProducts[0].variants[1].id)
        assert.equal(res.body.line_items[0].quantity, 1)
        assert.equal(res.body.line_items[0].sku, 'printer-w-123')
        assert.equal(res.body.line_items[0].title, 'Maker Bot Replicator')
        assert.equal(res.body.line_items[0].variant_title, 'Mini')
        assert.equal(res.body.line_items[0].name, 'Maker Bot Replicator - Mini')
        assert.equal(res.body.line_items[0].price, 90000)
        assert.equal(res.body.line_items[0].weight, 20)
        assert.equal(res.body.line_items[0].weight_unit, 'lb')
        assert.equal(res.body.line_items[0].grams, 9071.847392)
        assert.equal(res.body.line_items[0].images.length, 1)

        assert.equal(res.body.line_items[1].product_id, shopProducts[1].id)
        assert.equal(res.body.line_items[1].variant_id, shopProducts[1].variants[0].id)
        assert.equal(res.body.line_items[1].quantity, 2)
        assert.equal(res.body.line_items[1].grams, 18143.694784)

        assert.equal(res.body.line_items[2].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[2].variant_id, shopProducts[0].variants[0].id)
        assert.equal(res.body.line_items[2].quantity, 1)
        assert.equal(res.body.line_items[2].grams, 9071.847392)
        done(err)
      })
  })
  // TODO
  it.skip('should make addCoupon request', (done) => {
    request
      .post(`/cart/${cartID}/addCoupon`)
      .send({

      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS CART', res.body)
        // assert.equal(res.body.id, cartID)
        done(err)
      })
  })
  it.skip('should make addDiscount request', (done) => {
    request
      .post(`/cart/${cartID}/addDiscount`)
      .send({

      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS CART', res.body)
        // assert.equal(res.body.id, cartID)
        done(err)
      })
  })
  it('should make checkout post request', (done) => {
    request
      .post(`/cart/${cartID}/checkout`)
      .send({
        payment_kind: 'immediate',
        transaction_kind: 'sale',
        payment_details: [
          {
            gateway: 'payment_processor',
            token: '123'
          }
        ],
        fulfillment_kind: 'immediate'
      })
      .expect(200)
      .end((err, res) => {
        // console.log('Current Work', res.body.order)
        orderID = res.body.order.id
        assert.ok(res.body.order.id)
        assert.ok(res.body.order.token)

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
        assert.equal(res.body.order.order_items[0].order_id, orderID)
        assert.equal(res.body.order.order_items[1].order_id, orderID)
        assert.equal(res.body.order.order_items[2].order_id, orderID)

        assert.equal(res.body.order.order_items[0].fulfillment_id, res.body.order.fulfillments[0].id)
        assert.equal(res.body.order.order_items[1].fulfillment_id, res.body.order.fulfillments[0].id)
        assert.equal(res.body.order.order_items[2].fulfillment_id, res.body.order.fulfillments[0].id)
        assert.equal(res.body.order.order_items[0].fulfillment_status, 'sent')
        assert.equal(res.body.order.order_items[1].fulfillment_status, 'sent')
        assert.equal(res.body.order.order_items[2].fulfillment_status, 'sent')

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        assert.equal(res.body.order.transactions[0].kind, 'sale')
        assert.equal(res.body.order.transactions[0].status, 'success')
        assert.equal(res.body.order.transactions[0].source_name, 'web')
        assert.equal(res.body.order.transactions[0].order_id, orderID)

        // Fulfillment
        assert.equal(res.body.order.fulfillments.length, 1)
        assert.equal(res.body.order.fulfillments[0].status, 'sent')
        assert.equal(res.body.order.fulfillments[0].order_id, orderID)

        // Events
        assert.equal(res.body.order.events.length, 4)
        res.body.order.events.forEach(event => {
          assert.equal(event.object_id, orderID)
        })

        // Cart
        assert.equal(res.body.cart.status, 'open')

        done(err)
      })
  })
  it('should get checked out cart and status should be ordered', (done) => {
    request
      .get(`/cart/${cartID}`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.status, 'ordered')
        done(err)
      })
  })
  it('should count all carts', (done) => {
    request
      .get('/cart/count')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.carts)
        done(err)
      })
  })
})
