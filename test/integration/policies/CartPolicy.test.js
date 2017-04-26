'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('CartPolicy', () => {
  let request, agent, userID, customerID, cartID, cartIDSwitch, orderID, subscriptionID, sourceID
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
        // console.log('THIS POLICY CART', res.body)
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
        userID = res.body.user.id
        customerID = res.body.user.current_customer_id
        assert.ok(res.body.user.id)
        assert.equal(res.body.user.current_cart_id, cartID)
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.policies['CartPolicy'])
    assert(global.app.policies['CartPolicy'])
  })
  it('should add customer to collection', (done) => {
    global.app.orm['Collection']
      .findByHandle('customer-discount-test')
      .then(collection => {
        if (!collection) {
          const err = 'Not Found'
          done(err)
        }
        // console.log('CUSTOMER WITH DISCOUNT', customerID, collection.id)
        return collection.addCustomer(customerID)
      })
      .then(customer => {
        // console.log('CUSTOMER WITH DISCOUNT COLLECTION', customer)
        done()
      })
      .catch(err => {
        // console.log('Customer with handle', err)
        done(err)
      })
  })
  it('should login to cart', done => {
    agent
      .post('/cart/login')
      .send({ })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CART', res.body)
        cartID = res.body.id
        assert.equal(res.body.customer_id, customerID)
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
        assert.equal(res.body.customer_id, customerID)
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
        assert.equal(res.body.customer_id, customerID)
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
        // console.log('THIS POLICY CART', res.body)
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
        // console.log('THIS POLICY CART', res.body)
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
        // console.log('ORDER ITEMS', res.body.order.order_items)

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
        assert.equal(res.body.order.order_items[0].product_id, shopProducts[3].id)
        assert.equal(res.body.order.order_items[0].price, shopProducts[3].price)
        assert.equal(res.body.order.order_items[0].total_discounts, 100)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[3].price - 100)
        assert.equal(res.body.order.order_items[0].product_id, shopProducts[3].id)

        assert.equal(res.body.order.order_items[1].order_id, orderID)
        assert.ok(res.body.order.order_items[1].fulfillment_id)
        assert.equal(res.body.order.order_items[1].fulfillment_status, 'fulfilled')
        assert.equal(res.body.order.order_items[1].fulfillment_service, 'manual')
        assert.equal(res.body.order.order_items[1].product_id, shopProducts[4].id)
        assert.equal(res.body.order.order_items[1].price, shopProducts[4].price)
        assert.equal(res.body.order.order_items[1].total_discounts, 200)
        assert.equal(res.body.order.order_items[1].calculated_price, shopProducts[4].price - 200)
        assert.equal(res.body.order.order_items[1].product_id, shopProducts[4].id)

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        assert.equal(res.body.order.transactions[0].kind, 'sale')
        assert.equal(res.body.order.transactions[0].status, 'success')
        assert.equal(res.body.order.transactions[0].source_name, 'web')
        assert.equal(res.body.order.transactions[0].order_id, orderID)

        // Events
        assert.equal(res.body.order.events.length, 2)

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
        orderID = res.body[0].id
        assert.equal(res.body.length, 1)
        done(err)
      })
  })
  it('should get session customer order by id', done => {
    agent
      .get(`/customer/order/${ orderID }`)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY ORDERS', res.body)
        assert.equal(res.body.id, orderID)
        done(err)
      })
  })
  it('should get session customer subscriptions', done => {
    agent
      .get('/customer/subscriptions')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY subscriptions', res.body)
        subscriptionID = res.body[0].id
        assert.equal(res.body.length, 1)
        done(err)
      })
  })
  it('should get session customer subscription by id', done => {
    agent
      .get(`/customer/subscription/${ subscriptionID }`)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY subscription', res.body)
        assert.equal(res.body.id, subscriptionID)
        done(err)
      })
  })
  it('should cancel customer subscription by id', done => {
    agent
      .post(`/subscription/${ subscriptionID }/cancel`)
      .send({
        reason: 'customer'
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY subscription', res.body)
        assert.equal(res.body.id, subscriptionID)
        assert.equal(res.body.active, false)
        assert.equal(res.body.cancel_reason, 'customer')
        assert.ok(res.body.cancelled_at)
        assert.ok(res.body.renews_on)
        done(err)
      })
  })
  it('should activate customer subscription by id', done => {
    agent
      .post(`/subscription/${ subscriptionID }/activate`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY subscription', res.body)
        assert.equal(res.body.id, subscriptionID)
        assert.equal(res.body.active, true)
        assert.equal(res.body.cancel_reason, null)
        assert.equal(res.body.cancelled_at, null)
        done(err)
      })
  })
  it('should update customer subscription by id', done => {
    agent
      .post(`/subscription/${ subscriptionID }`)
      .send({
        interval: 2,
        unit: 'm'
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY subscription', res.body)
        assert.equal(res.body.id, subscriptionID)
        assert.equal(res.body.active, true)
        assert.equal(res.body.interval, 2)
        assert.equal(res.body.unit, 'm')
        assert.ok(res.body.renews_on)
        done(err)
      })
  })
  it('should renew subscription', done => {
    global.app.services.SubscriptionService.renew(subscriptionID)
      .then(body => {
        // console.log('THIS RENEW', body.order)
        const orderID = body.order.id
        assert.ok(body.subscription.id)
        assert.ok(body.order.id)
        assert.ok(body.order.token)
        assert.equal(body.subscription.total_renewals, 1)

        assert.equal(body.order.financial_status, 'paid')
        assert.equal(body.order.currency, 'USD')
        assert.equal(body.order.source_name, 'api')
        assert.equal(body.order.processing_method, 'subscription')
        assert.equal(body.order.subtotal_price, shopProducts[3].price + shopProducts[4].price)
        assert.equal(body.order.total_price, shopProducts[3].price + shopProducts[4].price - body.order.total_discounts)
        assert.equal(body.order.total_discounts, 300)
        assert.equal(body.order.discounted_lines.length, 2)
        assert.equal(body.order.total_due, 0)

        assert.equal(body.order.order_items.length, 2)

        assert.equal(body.order.order_items[0].order_id, orderID)
        assert.ok(body.order.order_items[0].fulfillment_id)
        assert.equal(body.order.order_items[0].fulfillment_status, 'fulfilled')
        assert.equal(body.order.order_items[0].fulfillment_service, 'manual')
        assert.equal(body.order.order_items[0].product_id, shopProducts[3].id)
        assert.equal(body.order.order_items[0].price, shopProducts[3].price)
        assert.equal(body.order.order_items[0].total_discounts, 100)
        assert.equal(body.order.order_items[0].calculated_price, shopProducts[3].price - 100)
        assert.equal(body.order.order_items[0].product_id, shopProducts[3].id)

        assert.equal(body.order.order_items[1].order_id, orderID)
        assert.ok(body.order.order_items[1].fulfillment_id)
        assert.equal(body.order.order_items[1].fulfillment_status, 'fulfilled')
        assert.equal(body.order.order_items[1].fulfillment_service, 'manual')
        assert.equal(body.order.order_items[1].product_id, shopProducts[4].id)
        assert.equal(body.order.order_items[1].price, shopProducts[4].price)
        assert.equal(body.order.order_items[1].total_discounts, 200)
        assert.equal(body.order.order_items[1].calculated_price, shopProducts[4].price - 200)
        assert.equal(body.order.order_items[1].product_id, shopProducts[4].id)

        // Transactions
        assert.equal(body.order.transactions.length, 1)
        assert.equal(body.order.transactions[0].kind, 'sale')
        assert.equal(body.order.transactions[0].status, 'success')
        assert.equal(body.order.transactions[0].source_name, 'web')
        assert.equal(body.order.transactions[0].order_id, orderID)
        // Events
        assert.equal(body.order.events.length, 2)

        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })
  it('should get session customer accounts', done => {
    agent
      .get('/customer/accounts')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY subscriptions', res.body)
        assert.equal(res.body.length, 1)
        done(err)
      })
  })
  it('should get session customer sources', done => {
    agent
      .get('/customer/sources')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY subscriptions', res.body)
        assert.equal(res.body.length, 1)
        done(err)
      })
  })
  it('should add session customer source', done => {
    agent
      .post('/customer/source')
      .send({
        source: {
          gateway: 'payment_processor',
          token: 'abc123'
        }
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY SOURCE', res.body)
        sourceID = res.body.id
        assert.ok(res.body.id)
        assert.ok(res.body.payment_details)
        done(err)
      })
  })
  it('should update session customer source', done => {
    agent
      .post(`/customer/source/${ sourceID }`)
      .send({
        source: {
          gateway: 'payment_processor',
          exp_month: '12',
          exp_year: '2018'
        }
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY SOURCE', res.body)
        sourceID = res.body.id
        assert.ok(res.body.id)
        done(err)
      })
  })
  it('should remove session customer source', done => {
    agent
      .delete(`/customer/source/${ sourceID }`)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY SOURCE', res.body)
        assert.ok(res.body.id)
        done(err)
      })
  })

  it('It should get product by handle with calculated prices', (done) => {
    agent
      .get('/product/handle/discount-test')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS DISCOUNT TEST', res.body)
        assert.ok(res.body)
        assert.equal(res.body.handle, 'discount-test')
        assert.ok(res.body.calculated_price)
        assert.ok(res.body.total_discounts)
        done()
      })
  })
  it('It should get all users with associated customer account', (done) => {
    agent
      .get('/customer/users')
      .expect(200)
      .end((err, res) => {
        // console.log('Customer Users', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].id, userID)
        done()
      })
  })
  it('It should get all users with associated customer account', (done) => {
    agent
      .get(`/customer/${ customerID }/users`)
      .expect(200)
      .end((err, res) => {
        // console.log('Customer Users', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].id, userID)
        done()
      })
  })
  it('It should get all users with associated customer account', (done) => {
    agent
      .get('/user/customers')
      .expect(200)
      .end((err, res) => {
        console.log('Customer Users', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].id, customerID)
        done()
      })
  })
  it('It should get all users with associated customer account', (done) => {
    agent
      .get(`/user/${ userID }/customers`)
      .expect(200)
      .end((err, res) => {
        console.log('Customer Users', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].id, customerID)
        done()
      })
  })
  it('It should get all users with associated customer account', (done) => {
    agent
      .post(`/cart/${ cartIDSwitch }/pricingOverrides`)
      .send([{
        name: 'Test Override',
        price: 100
      }])
      .expect(200)
      .end((err, res) => {
        // console.log('Pricing Overrides', res.body)
        assert.equal(res.body.total_overrides, 100)
        done()
      })
  })
  it('It should get all users with associated customer account', (done) => {
    agent
      .post(`/cart/${ cartIDSwitch }/pricingOverrides`)
      .send({
        pricing_overrides: [{
          name: 'Test Override',
          price: 100
        }]
      })
      .expect(200)
      .end((err, res) => {
        // console.log('Pricing Overrides', res.body)
        assert.equal(res.body.total_overrides, 100)
        done()
      })
  })
  it('It should Update Account Balance', (done) => {
    agent
      .post(`/customer/${ customerID }/accountBalance`)
      .send({
        account_balance: 100
      })
      .expect(200)
      .end((err, res) => {
        // console.log('Customer Account Balance', res.body)
        assert.equal(res.body.account_balance, 100)
        done()
      })
  })
  it('should have pricing overrides', done => {
    agent
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[3].id
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        assert.equal(res.body.pricing_overrides[0].price, 100)
        assert.equal(res.body.total_overrides, 100)
        assert.equal(res.body.total_due, 99800)
        done(err)
      })
  })
  it('should checkout with overrides and balance', done => {
    agent
      .post('/cart/checkout')
      .send({
        payment_kind: 'sale',
        payment_details: [],
        fulfillment_kind: 'immediate'
      })
      .expect(200)
      .end((err, res) => {
        console.log('Customer Account Balance', res.body.order)
        assert.ok(res.body.order.id)
        assert.equal(res.body.order.total_discounts, 100)
        assert.equal(res.body.order.pricing_overrides[0].price, 100)
        assert.equal(res.body.order.pricing_overrides[1].price, 100)
        // There's a prior discount on one item of 100
        assert.equal(res.body.order.total_price, 99700)
        assert.equal(res.body.order.total_due, 0)
        done(err)
      })
  })
  it('It should get customer and Account Balance should now be 0', (done) => {
    agent
      .get(`/customer/${ customerID }`)
      .expect(200)
      .end((err, res) => {
        // console.log('Customer Account Balance', res.body)
        assert.equal(res.body.account_balance, 0)
        done()
      })
  })
})
