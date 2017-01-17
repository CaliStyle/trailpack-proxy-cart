'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
// const products = require('../../fixtures/products')
const customers = require('../../fixtures/customers')

describe('CartController', () => {
  let request
  let cartID
  let customerID
  let orderID
  let shopID
  let shopProducts

  before((done) => {
    shopID = global.app.shopID
    shopProducts = global.app.shopProducts
    request = supertest('http://localhost:3000')
    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['CartController'])
  })
  // TODO support cart with default items
  it('should create a cart', (done) => {
    request
      .post('/cart')
      .send({
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        cartID = res.body.id
        console.log('THIS CART', res.body)
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
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[0].id)

        // Line Items
        assert.equal(res.body.line_items[0].grams, 9071.847392)
        done(err)
      })
  })

  it('should make addItems post request and increment quantity', (done) => {
    request
      .post(`/cart/${cartID}/addItems`)
      .send([
        {
          product_id: shopProducts[0].id
        }
      ])
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[0].quantity, 2)
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
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[0].id)
        assert.equal(res.body.line_items[0].quantity, 1)
        done(err)
      })
  })

  it('should make removeItems post request with just a product_id', (done) => {
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
        assert.equal(res.body.line_items.length, 0)
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
        }
      ])
      .expect(200)
      .end((err, res) => {
        console.log('THIS CART', res.body)
        assert.equal(res.body.id, cartID)

        assert.equal(res.body.line_items.length, 2)
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
        done(err)
      })
  })
  it.skip('should make addCoupon request', (done) => {
  })
  it.skip('should make addDiscount request', (done) => {
  })
  it('should make checkout post request', (done) => {
    request
      .post(`/cart/${cartID}/checkout`)
      .send({
        payment_kind: 'sale',
        payment_details: [
          {
            token: '123'
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        console.log('CHECKOUT', res.body)
        orderID = res.body.id
        assert.ok(res.body.id)
        assert.ok(res.body.token)

        assert.equal(res.body.financial_status, 'paid')
        assert.equal(res.body.currency, 'USD')
        assert.equal(res.body.source_name, 'api')
        assert.equal(res.body.processing_method, 'checkout')
        assert.ok(res.body.subtotal_price)
        // Order Items
        assert.equal(res.body.order_items.length, 2)
        assert.equal(res.body.order_items[0].order_id, orderID)
        // Transactions
        assert.equal(res.body.transactions.length, 1)
        assert.equal(res.body.transactions[0].kind, 'sale')
        assert.equal(res.body.transactions[0].status, 'success')
        assert.equal(res.body.transactions[0].source_name, 'web')
        assert.equal(res.body.transactions[0].order_id, orderID)

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
