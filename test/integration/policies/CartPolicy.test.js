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
            product_id: shopProducts[3].id
          },
          {
            product_id: shopProducts[4].id
          },
          {
            product_id: shopProducts[2].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartIDSwitch)
        assert.equal(res.body.line_items.length, 3)
        assert.equal(res.body.line_items[0].product_id, shopProducts[3].id)
        assert.equal(res.body.line_items[1].product_id, shopProducts[4].id)
        assert.equal(res.body.line_items[2].product_id, shopProducts[2].id)
        assert.equal(res.body.subtotal_price, shopProducts[3].price + shopProducts[4].price + shopProducts[2].price)
        done(err)
      })
  })
  it('should remove products to switched cart', done => {
    agent
      .post('/cart/removeItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[2].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartIDSwitch)
        assert.equal(res.body.line_items.length, 2)
        assert.equal(res.body.line_items[0].product_id, shopProducts[3].id)
        assert.equal(res.body.line_items[1].product_id, shopProducts[4].id)
        assert.equal(res.body.subtotal_price, shopProducts[3].price + shopProducts[4].price)
        done(err)
      })
  })
  // it('should find product with collection', (done) => {
  //   request
  //     .get('/product/collection/test-discount')
  //     .expect(200)
  //     .end((err, res) => {
  //       console.log('THIS COLLECTION',res.body)
  //       assert.equal(res.body[0].collections[0].handle, 'test-discount')
  //       assert.equal(res.body[0].collections[0].title, 'Test Discount')
  //       assert.equal(res.body[0].collections[0].discount_scope, 'global')
  //       assert.equal(res.body[0].collections[0].discount_type, 'fixed')
  //       assert.equal(res.body[0].collections[0].discount_rate, '100')
  //       done(err)
  //     })
  // })
  it('should get cart in session', done => {
    agent
      .get('/cart/session')
      .expect(200)
      .end((err, res) => {
        console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartIDSwitch)
        assert.equal(res.body.line_items.length, 2)
        assert.equal(res.body.line_items[0].product_id, shopProducts[3].id)
        assert.equal(res.body.line_items[0].price, shopProducts[3].price)
        assert.equal(res.body.line_items[0].calculated_price, shopProducts[3].price - 100)
        assert.equal(res.body.line_items[1].product_id, shopProducts[4].id)
        assert.equal(res.body.line_items[1].price, shopProducts[4].price)
        assert.equal(res.body.line_items[1].calculated_price, shopProducts[4].price - 200)
        assert.equal(res.body.total_discounts, 300)
        assert.equal(res.body.discounted_lines.length, 2)
        assert.equal(res.body.total_due, shopProducts[3].price + shopProducts[4].price - res.body.total_discounts)
        assert.equal(res.body.subtotal_price, shopProducts[3].price + shopProducts[4].price)
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
        console.log('CHECKOUT', res.body.order)
        // console.log('ORDER ITEMS', res.body.order_items)

        const orderID = res.body.order.id
        cartIDSwitch = res.body.cart.id
        assert.ok(res.body.cart.id)
        assert.ok(res.body.order.id)
        assert.ok(res.body.order.token)

        assert.equal(res.body.order.financial_status, 'paid')
        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.equal(res.body.order.subtotal_price, shopProducts[3].price + shopProducts[4].price)
        assert.equal(res.body.order.total_price, shopProducts[3].price + shopProducts[4].price - res.body.order.total_discounts)
        assert.equal(res.body.order.total_discounts, 300)
        assert.equal(res.body.order.discounted_lines.length, 2)
        assert.equal(res.body.order.total_due, 0)


        // Order Items
        // TODO check quantities
        assert.equal(res.body.order.order_items.length, 2)
        assert.equal(res.body.order.order_items[0].order_id, orderID)
        assert.ok(res.body.order.order_items[0].fulfillment_id)
        assert.equal(res.body.order.order_items[0].fulfillment_status, 'fulfilled')
        assert.equal(res.body.order.order_items[0].fulfillment_service, 'manual')
        assert.ok(res.body.order.order_items[0].calculated_price)

        assert.equal(res.body.order.order_items[1].order_id, orderID)
        assert.ok(res.body.order.order_items[1].fulfillment_id)
        assert.equal(res.body.order.order_items[1].fulfillment_status, 'fulfilled')
        assert.equal(res.body.order.order_items[1].fulfillment_service, 'manual')
        assert.ok(res.body.order.order_items[1].calculated_price)
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
  it('should get session customer orders', done => {
    agent
      .get('/customer/orders')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY ORDERS', res.body)
        assert.equal(res.body.length, 1)
        done(err)
      })
  })
  // it('should checkout switch cart and create subscription', done => {
  //   agent
  //     .post('/cart/checkout')
  //     .send({
  //       payment_kind: 'sale',
  //       payment_details: [
  //         {
  //           gateway: 'payment_processor',
  //           token: '123'
  //         }
  //       ],
  //       fulfillment_kind: 'immediate'
  //     })
  //     .expect(200)
  //     .end((err, res) => {
  //       console.log('THIS POLICY ORDER', res.body.order)
  //       // assert.equal(res.body)
  //       done(err)
  //     })
  // })
})
