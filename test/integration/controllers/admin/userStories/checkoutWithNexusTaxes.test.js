const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin User Checkout with Nexus Taxes', () => {
  let adminUser, userID, customerID, cartID, shopID, shopProducts, orderID, transactionID
  let discountService, discountID

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
  it('should create/init a cart', (done) => {
    adminUser
      .post('/cart/init')
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        cartID = res.body.id
        assert.equal(res.body.customer_id, customerID)
        done(err)
      })
  })
  it('should update the cart with shipping address in the same province as the store', (done) => {
    adminUser
      .put('/cart')
      .send({
        shipping_address: {
          first_name: 'Scotty',
          last_name: 'W',
          address_1: '1260 Phillips St.',
          address_2: '',
          company: 'Shipping Department',
          city: 'Vista',
          phone: '',
          province_code: 'CA',
          country_code: 'US',
          postal_code: '92083'
        }
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        assert.equal(cartID, res.body.id)
        assert.equal(res.body.customer_id, customerID)
        assert.equal(res.body.total_items, 0)
        assert.equal(res.body.shipping_address.first_name, 'Scotty')
        assert.equal(res.body.shipping_address.last_name, 'W')
        assert.equal(res.body.shipping_address.address_1, '1260 Phillips St.')
        assert.equal(res.body.shipping_address.address_2, null)
        assert.equal(res.body.shipping_address.address_3, null)
        assert.equal(res.body.shipping_address.company, 'Shipping Department')
        assert.equal(res.body.shipping_address.city, 'Vista')
        assert.equal(res.body.shipping_address.phone, null)
        assert.equal(res.body.shipping_address.province_code, 'CA')
        assert.equal(res.body.shipping_address.country_code, 'US')
        assert.equal(res.body.shipping_address.postal_code, '92083')
        done(err)
      })
  })
  it('should add product with property pricing to cart', done => {
    adminUser
      .post('/cart/addItems')
      .send({
        line_items: [
          {
            product_id: shopProducts[13].id,
            properties: [{
              name: 'engraving',
              value: 'CUSTOM Engraving'
            }]
          }
        ]
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)

        // Taxes
        assert.equal(res.body.has_taxes, true)
        assert.equal(res.body.total_tax, 7758)
        assert.equal(res.body.taxes_included, false)
        assert.equal(res.body.tax_lines.length, 1)
        assert.equal(res.body.tax_lines[0].name, 'California Sales Tax')
        assert.equal(res.body.tax_lines[0].price, 7758)


        assert.equal(res.body.total_due, res.body.total_tax + shopProducts[13].price + 100)
        assert.equal(res.body.total_line_items_price, shopProducts[13].price + 100)
        assert.equal(res.body.total_price, res.body.total_tax + shopProducts[13].price + 100)
        assert.equal(res.body.total_due, res.body.total_tax + shopProducts[13].price + 100)
        assert.equal(res.body.line_items.length, 1)

        assert.equal(res.body.line_items[0].price, shopProducts[13].price + 100)
        assert.equal(res.body.line_items[0].calculated_price, shopProducts[13].price + 100)
        assert.equal(res.body.line_items[0].price_per_unit, shopProducts[13].price + 100)
        assert.equal(res.body.line_items[0].properties['engraving']['value'], 'CUSTOM Engraving')
        assert.equal(res.body.line_items[0].properties['engraving']['price'], 100)
        done(err)
      })
  })
  it('should checkout and item', (done) => {
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
        fulfillment_kind: 'immediate',

      })
      .expect(200)
      .end((err, res) => {
        orderID = res.body.order.id

        // Taxes
        assert.equal(res.body.order.has_taxes, true)
        assert.equal(res.body.order.total_tax, 7758)
        assert.equal(res.body.order.taxes_included, false)
        assert.equal(res.body.order.tax_lines.length, 1)
        assert.equal(res.body.order.tax_lines[0].name, 'California Sales Tax')
        assert.equal(res.body.order.tax_lines[0].price, 7758)

        // console.log('BROKE USER STORY', res.body.order)

        assert.ok(res.body.order.id)
        assert.ok(res.body.order.token)
        assert.equal(res.body.order.customer_id, customerID)
        assert.equal(res.body.order.payment_kind, 'immediate')
        assert.equal(res.body.order.transaction_kind, 'sale')
        assert.equal(res.body.order.fulfillment_kind, 'immediate')

        assert.equal(res.body.order.currency, 'USD')
        assert.equal(res.body.order.source_name, 'api')
        assert.equal(res.body.order.processing_method, 'checkout')
        assert.equal(res.body.order.financial_status, 'paid')

        // This is a digital good
        assert.equal(res.body.order.fulfillment_status, 'fulfilled')
        assert.equal(res.body.order.status, 'closed')
        assert.equal(_.isString(res.body.order.closed_at), true)

        // Pricing
        assert.equal(res.body.order.total_line_items_price, shopProducts[13].price + 100)
        assert.equal(res.body.order.subtotal_price, shopProducts[13].price + 100)
        assert.equal(res.body.order.total_price, res.body.order.total_tax + shopProducts[13].price + 100)
        assert.equal(res.body.order.total_due, 0)
        assert.equal(res.body.order.total_discounts, 0)
        assert.equal(res.body.order.total_captured, res.body.order.total_tax + shopProducts[13].price + 100)

        // Order Items
        assert.equal(res.body.order.order_items.length, 1)
        assert.equal(res.body.order.total_items, 1)
        assert.equal(res.body.order.order_items[0].price, shopProducts[13].price + 100)
        assert.equal(res.body.order.order_items[0].price_per_unit, shopProducts[13].price + 100)
        assert.equal(res.body.order.order_items[0].calculated_price, shopProducts[13].price + 100)
        assert.equal(res.body.order.order_items[0].total_discounts, 0)
        assert.equal(res.body.order.order_items[0].total_tax, res.body.total_tax)

        assert.equal(res.body.order.order_items[0].properties['engraving']['value'], 'CUSTOM Engraving')
        assert.equal(res.body.order.order_items[0].properties['engraving']['price'], 100)

        res.body.order.order_items.forEach(item => {
          assert.equal(item.order_id, orderID)
          assert.equal(item.fulfillment_status, 'fulfilled')
          assert.equal(item.fulfillment_id, res.body.order.fulfillments[0].id)
        })

        // Fulfillment
        assert.equal(res.body.order.fulfillments.length, 1)
        res.body.order.fulfillments.forEach(fulfillment => {
          assert.equal(fulfillment.status, 'fulfilled')
          assert.equal(fulfillment.order_id, orderID)
        })
        assert.equal(res.body.order.total_pending_fulfillments, 0)
        assert.equal(res.body.order.total_sent_fulfillments, 0)
        assert.equal(res.body.order.total_fulfilled_fulfillments, 1)
        assert.equal(res.body.order.total_partial_fulfillments, 0)

        // Transactions
        assert.equal(res.body.order.transactions.length, 1)
        transactionID = res.body.order.transactions[0].id
        res.body.order.transactions.forEach(transaction => {
          assert.equal(transaction.kind, 'sale')
          assert.equal(transaction.status, 'success')
          assert.equal(transaction.source_name, 'web')
          assert.equal(transaction.order_id, orderID)
        })
        assert.equal(res.body.order.total_pending, 0)
        assert.equal(res.body.order.total_authorized, 0)
        assert.equal(res.body.order.total_voided, 0)
        assert.equal(res.body.order.total_cancelled, 0)
        assert.equal(res.body.order.total_refunds, 0)
        assert.equal(res.body.order.total_captured, res.body.order.total_tax + shopProducts[13].price + 100)

        // Events: Removed from the default query
        // assert.equal(res.body.order.events.length, 4)
        // res.body.order.events.forEach(event => {
        //   assert.equal(event.object_id, orderID)
        // })

        done(err)
      })
  })
})
