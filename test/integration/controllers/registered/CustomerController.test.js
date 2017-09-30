'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const customers = require('../../../fixtures/customers')
const _ = require('lodash')

describe('Registered User CustomerController', () => {
  let registeredUser, userID, customerID, addressID, sourceID, accountID

  before((done) => {

    registeredUser = supertest.agent(global.app.packs.express.server)
    // Login as Registered
    registeredUser
      .post('/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({
        email: 'customercontroller@example.com',
        password: 'registered1234'
      })
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
    assert(global.app.api.controllers['CustomerController'])
  })
  it.skip('should not get general stats', (done) => {
    registeredUser
      .get('/customer/generalStats')
      .expect(401)
      .end((err, res) => {
        done(err)
      })
  })
  it('should create a customer with a default address', (done) => {
    const customer = customers[1]
    registeredUser
      .post('/customer')
      .send(customer)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, customer.first_name)
        assert.equal(res.body.last_name, customer.last_name)
        done(err)
      })
  })
  it('should find created customer', (done) => {
    const customer = customers[1]
    registeredUser
      .get('/customer')
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, customer.first_name)
        assert.equal(res.body.last_name, customer.last_name)
        done(err)
      })
  })
  it('should update customer', (done) => {
    registeredUser
      .put('/customer')
      .send({
        first_name: 'Scotty',
        last_name: 'W',
        shipping_address: {
          first_name: 'Scotty',
          last_name: 'W'
        }
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        // Address
        assert.equal(res.body.shipping_address.first_name, 'Scotty')
        assert.equal(res.body.shipping_address.last_name, 'W')
        done(err)
      })
  })
  it('should add customer address', (done) => {
    registeredUser
      .post('/customer/address')
      .send({
        address: {
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
        addressID = res.body.id
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        assert.equal(res.body.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.address_2, null)
        assert.equal(res.body.address_3, null)
        assert.equal(res.body.company, 'Shipping Department')
        assert.equal(res.body.city, 'Washington')
        assert.equal(res.body.phone, null)
        assert.equal(res.body.province_code, 'DC')
        assert.equal(res.body.country_code, 'US')
        assert.equal(res.body.postal_code, '20500')
        done(err)
      })
  })
  it('should update customer address', (done) => {
    registeredUser
      .put(`/customer/address/${addressID}`)
      .send({
        address: {
          first_name: 'Scotty',
          last_name: 'W',
          address_1: '1600 Pennsylvania Ave NW',
          address_2: '',
          company: 'Billing Department',
          city: 'Washington',
          phone: '',
          province_code: 'DC',
          country_code: 'US',
          postal_code: '20500'
        }
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        assert.equal(res.body.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.address_2, null)
        assert.equal(res.body.address_3, null)
        assert.equal(res.body.company, 'Billing Department')
        assert.equal(res.body.city, 'Washington')
        assert.equal(res.body.phone, null)
        assert.equal(res.body.province_code, 'DC')
        assert.equal(res.body.country_code, 'US')
        assert.equal(res.body.postal_code, '20500')
        done(err)
      })
  })
  it('should update customer and set as shipping address', (done) => {
    registeredUser
      .put(`/customer/address/${addressID}`)
      .send({
        shipping_address: {
          first_name: 'Scotty',
          last_name: 'W',
          address_1: '1600 Pennsylvania Ave NW',
          address_2: '',
          company: 'Billing Department',
          city: 'Washington',
          phone: '',
          province_code: 'DC',
          country_code: 'US',
          postal_code: '20500'
        }
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        assert.equal(res.body.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.address_2, null)
        assert.equal(res.body.address_3, null)
        assert.equal(res.body.company, 'Billing Department')
        assert.equal(res.body.city, 'Washington')
        assert.equal(res.body.phone, null)
        assert.equal(res.body.province_code, 'DC')
        assert.equal(res.body.country_code, 'US')
        assert.equal(res.body.postal_code, '20500')
        done(err)
      })
  })
  // TODO fix test
  it('should get customer addresses', (done) => {
    registeredUser
      .get('/customer/addresses')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        // assert.equal(res.headers['x-pagination-total'], '4')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        // assert.equal(res.body.length, 4)
        done(err)
      })
  })
  it('should destroy customer address', (done) => {
    registeredUser
      .delete(`/customer/address/${addressID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        assert.equal(res.body.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.address_2, null)
        assert.equal(res.body.address_3, null)
        assert.equal(res.body.company, 'Billing Department')
        assert.equal(res.body.city, 'Washington')
        assert.equal(res.body.phone, null)
        assert.equal(res.body.province_code, 'DC')
        assert.equal(res.body.country_code, 'US')
        assert.equal(res.body.postal_code, '20500')
        done(err)
      })
  })

  it('should get session customer orders', done => {
    registeredUser
      .get('/customer/orders')
      .expect(200)
      .end((err, res) => {

        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        done(err)
      })
  })

  // TODO Complete Test
  it.skip('should not add tag to customer', (done) => {
    registeredUser
      .post('/customer/addTag/1')
      .send({})
      .expect(401)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })
  // TODO complete test
  it.skip('should not get customer tags', (done) => {
    registeredUser
      .get('/customer/tags')
      .expect(401)
      .end((err, res) => {
        done(err)
      })
  })
  // TODO Complete Test
  it.skip('should not remove tag from customer', (done) => {
    registeredUser
      .post('/customer/removeTag/1')
      .send({})
      .expect(401)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })
  // TODO Complete Test
  it.skip('should not add customer to collection', (done) => {
    registeredUser
      .post('/customer/addCollection/1')
      .send({})
      .expect(401)
      .end((err, res) => {
        done(err)
      })
  })
  // TODO complete test
  it.skip('should not get customer collections', (done) => {
    registeredUser
      .get('/customer/collections')
      .expect(401)
      .end((err, res) => {
        done(err)
      })
  })
  // TODO Complete Test
  it.skip('should not remove customer from collection', (done) => {
    registeredUser
      .post('/customer/removeCollection/1')
      .send({})
      .expect(401)
      .end((err, res) => {
        done(err)
      })
  })
  // TODO Complete Test
  it.skip('should add customer account', (done) => {
    registeredUser
      .post('/customer/addAccount/1')
      .send({})
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })
  // TODO complete test
  it.skip('should get customer accounts', (done) => {
    registeredUser
      .get('/customer/accounts')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)
        done(err)
      })
  })
  // TODO Complete Test
  it.skip('should remove account from customer', (done) => {
    registeredUser
      .post('/customer/removeAccount/1')
      .send({})
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })

  // TODO complete test
  it('should get customer subscriptions', (done) => {
    registeredUser
      .get('/customer/subscriptions')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)
        done(err)
      })
  })

  it('should add customer source', done => {
    registeredUser
      .post('/customer/source')
      .send({
        source: {
          gateway: 'payment_processor',
          gateway_token: 'abc123'
        }
      })
      .expect(200)
      .end((err, res) => {
        sourceID = res.body.id
        accountID = res.body.account_id
        // assert.equal(res.body.customer_id, createdCustomerID)
        assert.equal(res.body.gateway, 'payment_processor')
        assert.ok(res.body.account_foreign_key)
        assert.ok(res.body.account_foreign_id)
        assert.ok(res.body.account_foreign_key)
        assert.ok(res.body.payment_details)
        assert.ok(res.body.account_id)
        assert.ok(res.body.is_default)

        done(err)
      })
  })
  it('should update customer source', done => {
    registeredUser
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
        // assert.equal(res.body.customer_id, createdCustomerID)
        assert.equal(res.body.id, sourceID)
        assert.equal(res.body.account_id, accountID)
        assert.equal(res.body.gateway, 'payment_processor')
        assert.ok(res.body.account_foreign_key)
        assert.ok(res.body.account_foreign_id)
        assert.ok(res.body.account_foreign_key)
        assert.ok(res.body.payment_details)
        assert.ok(res.body.is_default)
        done(err)
      })
  })
  it('should get customer sources', done => {
    registeredUser
      .get('/customer/sources')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)
        done(err)
      })
  })
  it('should remove customer source', done => {
    registeredUser
      .delete(`/customer/source/${ sourceID }`)
      .expect(200)
      .end((err, res) => {
        // assert.equal(res.body.customer_id, createdCustomerID)
        assert.equal(res.body.id, sourceID)
        assert.equal(res.body.account_id, accountID)
        assert.equal(res.body.gateway, 'payment_processor')
        assert.ok(res.body.account_foreign_key)
        assert.ok(res.body.account_foreign_id)
        assert.ok(res.body.account_foreign_key)
        assert.ok(res.body.payment_details)
        assert.ok(res.body.is_default)
        done(err)
      })
  })

  it('It should get customer users', (done) => {
    registeredUser
      .get('/customer/users')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
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

        done(err)
      })
  })

  it.skip('It should not upload customer_upload.csv', (done) => {
    registeredUser
      .post('/customer/uploadCSV')
      .attach('file', 'test/fixtures/customer_upload.csv')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('It should process upload', (done) => {
    registeredUser
      .post('/customer/processUpload/1')
      .send({})
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('It should not get customers', (done) => {
    registeredUser
      .get('/customers')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it.skip('It should not find uploaded customer', (done) => {
    registeredUser
      .get('/customer/1')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('It should not search customer', (done) => {
    registeredUser
      .get('/customers/search')
      .query({
        term: 'scott'
      })
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
