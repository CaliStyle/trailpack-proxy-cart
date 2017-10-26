'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')
const discounts = require('../../../fixtures/discounts')

describe('Admin User DiscountController', () => {
  let adminUser, userID, customerID, discountID

  before((done) => {

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
  it('should exist', () => {
    assert(global.app.api.controllers['DiscountController'])
  })
  it('should create a discount', (done) => {
    const discount = discounts[0]
    adminUser
      .post('/discount')
      .send(discount)
      .expect(200)
      .end((err, res) => {
        discountID = res.body.id
        assert.ok(res.body)
        assert.equal(res.body.name, discount.name)
        assert.equal(res.body.description, discount.description)
        assert.equal(res.body.code, discount.code)
        assert.equal(res.body.discount_type, discount.discount_type)
        assert.equal(res.body.discount_rate, discount.discount_rate)
        assert.equal(res.body.status, discount.status)
        assert.equal(res.body.minimum_order_amount, discount.minimum_order_amount)
        assert.equal(res.body.usage_limit, discount.usage_limit)
        assert.equal(res.body.applies_compound, false)

        done(err)
      })
  })
  it('should update a discount', (done) => {
    const discount = discounts[0]

    adminUser
      .post(`/discount/${discountID}`)
      .send({
        applies_compound: true
      })
      .expect(200)
      .end((err, res) => {
        // console.log('Admin User DiscountController',res.body)
        assert.ok(res.body)
        assert.equal(res.body.name, discount.name)
        assert.equal(res.body.description, discount.description)
        assert.equal(res.body.code, discount.code)
        assert.equal(res.body.discount_type, discount.discount_type)
        assert.equal(res.body.discount_rate, discount.discount_rate)
        assert.equal(res.body.status, discount.status)
        assert.equal(res.body.minimum_order_amount, discount.minimum_order_amount)
        assert.equal(res.body.usage_limit, discount.usage_limit)
        assert.equal(res.body.applies_compound, true)
        done(err)
      })
  })
  it('should destroy a discount', (done) => {
    const discount = discounts[0]

    adminUser
      .del(`/discount/${discountID}`)
      .expect(200)
      .end((err, res) => {
        // console.log('Admin User DiscountController',res.body)
        assert.equal(res.body.name, discount.name)
        assert.equal(res.body.description, discount.description)
        assert.equal(res.body.code, discount.code)
        assert.equal(res.body.discount_type, discount.discount_type)
        assert.equal(res.body.discount_rate, discount.discount_rate)
        assert.equal(res.body.status, discount.status)
        assert.equal(res.body.minimum_order_amount, discount.minimum_order_amount)
        assert.equal(res.body.usage_limit, discount.usage_limit)
        assert.equal(res.body.applies_compound, true)
        done(err)
      })
  })
  it('should get discounts', (done) => {
    adminUser
      .get('/discounts')
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

        assert.ok(res.body)
        done(err)
      })
  })
  it('should create a discount without any applicable items', (done) => {
    const discount = discounts[1]
    adminUser
      .post('/discount')
      .send(discount)
      .expect(200)
      .end((err, res) => {
        discountID = res.body.id
        assert.ok(res.body)
        assert.equal(res.body.name, discount.name)
        assert.equal(res.body.description, discount.description)
        assert.equal(res.body.code, discount.code)
        assert.equal(res.body.discount_type, discount.discount_type)
        assert.equal(res.body.discount_rate, discount.discount_rate)
        assert.equal(res.body.status, discount.status)
        assert.equal(res.body.minimum_order_amount, discount.minimum_order_amount)
        assert.equal(res.body.usage_limit, discount.usage_limit)
        assert.equal(res.body.applies_compound, false)

        done(err)
      })
  })
  it('should add product to discount', (done) => {
    const discount = discounts[1]

    adminUser
      .post(`/discount/${discountID}/product/1`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should get discount\'s products', (done) => {
    adminUser
      .get(`/discount/${discountID}/products`)
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
        assert.ok(res.body)
        done(err)
      })
  })
  it('should remove product from discount', (done) => {
    const discount = discounts[1]

    adminUser
      .del(`/discount/${discountID}/product/1`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })

  it('should add customer to discount', (done) => {
    const discount = discounts[1]

    adminUser
      .post(`/discount/${discountID}/customer/1`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should get discount\'s customers', (done) => {
    adminUser
      .get(`/discount/${discountID}/customers`)
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

        assert.ok(res.body)
        done(err)
      })
  })
  it('should remove customer from discount', (done) => {
    const discount = discounts[1]

    adminUser
      .del(`/discount/${discountID}/customer/1`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })

  it('should add cart to discount', (done) => {
    const discount = discounts[1]

    adminUser
      .post(`/discount/${discountID}/cart/1`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should get discount\'s carts', (done) => {
    adminUser
      .get(`/discount/${discountID}/carts`)
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

        assert.ok(res.body)
        done(err)
      })
  })
  it('should remove cart from discount', (done) => {
    const discount = discounts[1]

    adminUser
      .del(`/discount/${discountID}/cart/1`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
})
