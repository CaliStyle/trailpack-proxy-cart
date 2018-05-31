const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Edit Order Split Fulfillment', () => {
  let adminUser, userID, customerID, cartID, shopID, shopProducts, orderID, transactionID
  let createdProduct1, createdProduct2, createdProductVariant1, createdProductVariant2

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
  it('should make addProducts post adminUser', (done) => {
    adminUser
      .post('/product/addProducts')
      .send([
        {
          handle: 'split-fulfillment-1',
          title: 'Split Fulfillment 1',
          body: '<strong>Split Fulfillment 1!</strong>',
          vendors: [
            'ProxyCart'
          ],
          type: 'Split',
          price: '10000',
          published: true,
          sku: 'split-1',
          fulfillment_service: 'alt-1'
        },
        {
          handle: 'split-fulfillment-2',
          title: 'Split Fulfillment 2',
          body: '<strong>Split Fulfillment 2</strong>',
          vendors: [
            'ProxyCart'
          ],
          type: 'Split',
          price: '10000',
          published: true,
          sku: 'split-2',
          fulfillment_service: 'alt-2'
        }
      ])
      .expect(200)
      .end((err, res) => {
        createdProduct1 = res.body[0]
        createdProduct2 = res.body[1]
        createdProductVariant1 = createdProduct1.variants[0]
        createdProductVariant2 = createdProduct2.variants[0]
        assert.ok(createdProductVariant1)
        assert.ok(createdProductVariant2)
        assert.equal(res.body.length, 2)
        done(err)
      })
  })
  it('should add one of the products to the cart', done => {
    adminUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_variant_id: createdProductVariant1.id,
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.line_items.length, 1)
        done(err)
      })
  })
  it('should checkout with the product and create an order', (done) => {
    adminUser
      .post('/cart/checkout')
      .send({
        payment_kind: 'manual',
        transaction_kind: 'authorize',
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
        assert.equal(res.body.order.id, orderID)
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.financial_status, 'pending')
        assert.equal(res.body.order.fulfillment_status, 'pending')
        done(err)
      })
  })
  it('should add the other item with different fulfillment to order', (done) => {
    adminUser
      .post(`/order/${orderID}/addItems`)
      .send([{
        variant_id: createdProductVariant2.id,
        quantity: 1
      }])
      .expect(200)
      .end((err, res) => {
        // console.log('WORKING ON ORDERS', res.body)
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 2)
        assert.equal(res.body.total_items, 2)
        assert.equal(res.body.financial_status, 'pending')
        assert.equal(res.body.fulfillment_status, 'pending')

        // Transactions
        assert.equal(res.body.transactions.length, 1)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'pending')
        })

        // Fulfillments
        assert.equal(res.body.fulfillments.length, 2)
        assert.equal(res.body.fulfillments[0].order_id, orderID)
        assert.equal(res.body.fulfillments[0].status, 'pending')
        assert.equal(res.body.fulfillments[0].total_pending_fulfillments, 1)
        assert.equal(res.body.fulfillments[1].order_id, orderID)
        assert.equal(res.body.fulfillments[1].status, 'pending')
        assert.equal(res.body.fulfillments[1].total_pending_fulfillments, 1)
        done(err)
      })
  })
  it('should remove the other item with different fulfillment to order', (done) => {
    adminUser
      .post(`/order/${orderID}/removeItem`)
      .send({
        variant_id: createdProductVariant2.id,
        quantity: 1
      })
      .expect(200)
      .end((err, res) => {
        // console.log('WORKING ON ORDERS', res.body)
        assert.equal(res.body.id, orderID)
        assert.equal(res.body.order_items.length, 1)
        assert.equal(res.body.total_items, 1)
        assert.equal(res.body.financial_status, 'pending')
        assert.equal(res.body.fulfillment_status, 'pending')

        // Transactions
        assert.equal(res.body.transactions.length, 1)
        res.body.transactions.forEach(transaction => {
          assert.equal(transaction.order_id, orderID)
          assert.equal(transaction.kind, 'authorize')
          assert.equal(transaction.status, 'pending')
        })

        // Fulfillments TODO TEST FOR ACTUAL REMOVAL
        // assert.equal(res.body.fulfillments.length, 1)
        // assert.equal(res.body.fulfillments[0].order_id, orderID)
        // assert.equal(res.body.fulfillments[0].status, 'pending')
        // assert.equal(res.body.fulfillments[0].total_pending_fulfillments, 1)
        done(err)
      })
  })
})
