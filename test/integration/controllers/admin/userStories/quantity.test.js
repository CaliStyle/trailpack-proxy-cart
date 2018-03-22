'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Quantity', () => {
  let adminUser, userID, customerID, cartID, shopID, shopProducts, orderID, transactionID

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
        cartID = res.body.user.current_cart_id
        done(err)
      })
  })
  it('should add product to cart', done => {
    adminUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            variant_id: shopProducts[13].variants[0].id,
            quantity: 2
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        // console.log('THIS QUANTITY', res.body)
        assert.equal(res.body.subtotal_price, shopProducts[13].variants[0].price * 2)
        assert.equal(res.body.total_line_items_price, shopProducts[13].variants[0].price * 2)
        done(err)
      })
  })
})
