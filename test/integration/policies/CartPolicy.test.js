'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('CartPolicy', () => {
  let request, agent, cartID, cartIDSwitch
  let shopProducts

  before(done => {
    request = supertest('http://localhost:3000')
    agent = supertest.agent(global.app.packs.express.server)
    shopProducts = global.app.shopProducts

    agent
      .post('/cart/init')
      .send({ })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CART', res.body)
        cartID = res.body.id
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })

  it('should create a new cart', done => {
    agent
      .post('/cart')
      .send({ })
      .expect(200)
      .end((err, res) => {
        console.log('THIS POLICY CART', res.body)
        cartIDSwitch = res.body.id
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartIDSwitch)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })

  it('should create new user with created cart', done => {

    agent
      .post('/auth/local/register')
      .send({
        username: 'newuser',
        password: 'admin1234',
        current_cart_id: cartID
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.user.id)
        assert.equal(res.body.user.current_cart_id, cartID)
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.policies['CartPolicy'])
    assert(global.app.policies['CartPolicy'])
  })

  it('should login to cart', done => {
    agent
      .post('/cart/login')
      .send({ })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CART', res.body)
        cartID = res.body.id

        assert.ok(res.body.id)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })

  it('should add products to cart', done => {
    agent
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[1].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[1].id)
        assert.equal(res.body.subtotal_price, shopProducts[1].price)
        done(err)
      })
  })
  // TODO
  it('should switch cart', done => {
    agent
      .post(`/cart/${cartIDSwitch}/switch`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartIDSwitch)
        assert.equal(res.body.line_items.length, 0)
        // assert.equal(res.body.line_items[0].product_id, shopProducts[1].id)
        assert.equal(res.body.subtotal_price, 0)
        done(err)
      })
  })
  it('should add products to switched cart', done => {
    agent
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[2].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartIDSwitch)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[2].id)
        assert.equal(res.body.subtotal_price, shopProducts[2].price)
        done(err)
      })
  })
  it('should get cart in session', done => {
    agent
      .get('/cart/session')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartIDSwitch)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[2].id)
        assert.equal(res.body.subtotal_price, shopProducts[2].price)
        done(err)
      })
  })

  it('should make checkout post request', (done) => {
    agent
      .post('/cart/checkout')
      .send({
        payment_kind: 'sale',
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
        console.log('CHECKOUT', res.body)
        const orderID = res.body.order.id
        cartIDSwitch = res.body.cart.id
        assert.ok(res.body.cart.id)
        assert.ok(res.body.order.id)
        assert.ok(res.body.order.token)

        assert.equal(res.body.order.financial_status, 'paid')
        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.ok(res.body.order.subtotal_price)
        // Order Items
        // TODO check quantities
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.order_items[0].order_id, orderID)

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        assert.equal(res.body.order.transactions[0].kind, 'sale')
        assert.equal(res.body.order.transactions[0].status, 'success')
        assert.equal(res.body.order.transactions[0].source_name, 'web')
        assert.equal(res.body.order.transactions[0].order_id, orderID)

        done(err)
      })
  })
  it('should get new cart in session after checkout', done => {
    agent
      .get('/cart/session')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartIDSwitch)
        assert.equal(res.body.line_items.length, 0)
        done(err)
      })
  })
})
