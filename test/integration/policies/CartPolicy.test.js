'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('CartPolicy', () => {
  let request, agent, cartID
  let shopProducts

  before(done => {
    request = supertest('http://localhost:3000')
    agent = supertest.agent(global.app.packs.express.server)
    shopProducts = global.app.shopProducts

    agent
      .post('/auth/local')
      .send({
        username: 'admin',
        password: 'admin1234'
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        console.log('THIS USER',res.body)
        // assert.ok(res.body.id)
        // cartID = res.body.id
        // assert.equal(res.body.line_items.length, 1)
        // console.log('THIS POLICY CART', res.body)
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

  it('should get cart in session', done => {
    agent
      .get('/cart/session')
      .expect(200)
      .end((err, res) => {
        console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartID)
        assert.equal(res.body.line_items.length, 1)
        assert.equal(res.body.line_items[0].product_id, shopProducts[1].id)
        assert.equal(res.body.subtotal_price, shopProducts[1].price)
        done(err)
      })
  })

})
