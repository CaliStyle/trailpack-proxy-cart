'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')
const customers = require('../../../fixtures/customers')


describe('Admin User CustomerController', () => {
  let adminUser, userID, customerID, createdCustomerID, accountID, sourceID, addressID, uploadID, uploadedCustomerID

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
    assert(global.app.api.controllers['CustomerController'])
  })

  it('should get general stats', (done) => {
    adminUser
      .get('/customer/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })

  it('should create a customer with a default address', (done) => {
    const customer = customers[1]

    adminUser
      .post('/customer/create')
      .send(customer)
      .expect(200)
      .end((err, res) => {
        createdCustomerID = res.body.id
        assert.equal(res.body.first_name, customer.first_name)
        assert.equal(res.body.last_name, customer.last_name)
        assert.equal(res.body.metadata.test, customer.metadata.test)
        assert.equal(res.body.shipping_address.first_name, customer.default_address.first_name)
        assert.equal(res.body.shipping_address.last_name, customer.default_address.last_name)
        done(err)
      })
  })
  it('should find created customer', (done) => {
    const customer = customers[1]

    adminUser
      .get(`/customer/${createdCustomerID}`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, customer.first_name)
        assert.equal(res.body.last_name, customer.last_name)
        assert.equal(res.body.metadata.test, customer.metadata.test)
        assert.equal(res.body.shipping_address.first_name, customer.default_address.first_name)
        assert.equal(res.body.shipping_address.last_name, customer.default_address.last_name)

        done(err)
      })
  })
  it('should update customer', (done) => {
    adminUser
      .put(`/customer/${createdCustomerID}`)
      .send({
        first_name: 'Scotty',
        last_name: 'W',
        tags: ['edited'],
        metadata: {
          test: 'new value'
        },
        shipping_address: {
          first_name: 'Scotty',
          last_name: 'W'
        }
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        // Tags
        // tags length is broken on sqlite for this case
        assert.equal(res.body.tags.length, 1)
        assert.notEqual(res.body.tags.indexOf('edited'), -1)
        // Metadata
        assert.equal(res.body.metadata.test, 'new value')
        // Address
        assert.equal(res.body.shipping_address.first_name, 'Scotty')
        assert.equal(res.body.shipping_address.last_name, 'W')
        done(err)
      })
  })
  it('should add customer address', (done) => {
    adminUser
      .post(`/customer/${createdCustomerID}/address`)
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
    adminUser
      .post(`/customer/${createdCustomerID}/address/${addressID}`)
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
    adminUser
      .post(`/customer/${createdCustomerID}/address/${addressID}`)
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
  it('should get customer addresses', (done) => {
    adminUser
      .get(`/customer/${createdCustomerID}/addresses`)
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

        assert.equal(res.headers['x-pagination-total'], '4')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.equal(res.body.length, 4)
        done(err)
      })
  })
  it('should destroy customer address', (done) => {
    adminUser
      .delete(`/customer/${createdCustomerID}/address/${addressID}`)
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
  // TODO Complete Test
  it('should add tag to customer', (done) => {
    adminUser
      .post(`/customer/${createdCustomerID}/addTag/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })
  // TODO complete test
  it('should get customer tags', (done) => {
    adminUser
      .get(`/customer/${createdCustomerID}/tags`)
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
  it('should remove tag from customer', (done) => {
    adminUser
      .post(`/customer/${createdCustomerID}/removeTag/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })
  // TODO Complete Test
  it('should add customer to collection', (done) => {
    adminUser
      .post(`/customer/${createdCustomerID}/addCollection/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })
  // TODO complete test
  it('should get customer collections', (done) => {
    adminUser
      .get(`/customer/${createdCustomerID}/collections`)
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
  it('should should remove customer from collection', (done) => {
    adminUser
      .post(`/customer/${createdCustomerID}/removeCollection/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })


  // TODO Complete Test
  it.skip('should add customer account', (done) => {
    adminUser
      .post(`/customer/${createdCustomerID}/addAccount/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })
  // TODO complete test
  it('should get customer accounts', (done) => {
    adminUser
      .get(`/customer/${createdCustomerID}/accounts`)
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
  it.skip('should should remove account from customer', (done) => {
    adminUser
      .post(`/customer/${createdCustomerID}/removeAccount/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })

  // TODO complete test
  it('should get customer orders', (done) => {
    adminUser
      .get(`/customer/${createdCustomerID}/orders`)
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

  // TODO complete test
  it('should get customer subscriptions', (done) => {
    adminUser
      .get(`/customer/${createdCustomerID}/subscriptions`)
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
    adminUser
      .post(`/customer/${createdCustomerID}/source`)
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
        assert.equal(res.body.customer_id, createdCustomerID)
        assert.equal(res.body.gateway, 'payment_processor')
        assert.ok(res.body.account_foreign_key)
        assert.ok(res.body.account_foreign_id)
        assert.ok(res.body.account_foreign_key)
        assert.ok(res.body.payment_details)
        assert.ok(res.body.is_default)

        done(err)
      })
  })
  it('should update customer source', done => {
    adminUser
      .post(`/customer/${createdCustomerID}/source/${ sourceID }`)
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
        assert.equal(res.body.customer_id, createdCustomerID)
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
    adminUser
      .get(`/customer/${createdCustomerID}/sources`)
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
    adminUser
      .delete(`/customer/${createdCustomerID}/source/${ sourceID }`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.customer_id, createdCustomerID)
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
    adminUser
      .get(`/customer/${createdCustomerID}/users`)
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

  it('It should upload customer_upload.csv', (done) => {
    adminUser
      .post('/customer/uploadCSV')
      .attach('file', 'test/fixtures/customer_upload.csv')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.customers, 2)
        done(err)
      })
  })
  it('It should process upload', (done) => {
    adminUser
      .post(`/customer/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.customers, 2)
        assert.equal(res.body.errors_count, 0)
        done(err)
      })
  })
  it('It should get customers', (done) => {
    adminUser
      .get('/customers')
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

        assert.ok(res.body)
        // Most Freshly added customer
        uploadedCustomerID = res.body[1].id
        done(err)
      })
  })
  it('It should find uploaded customer', (done) => {
    adminUser
      .get(`/customer/${uploadedCustomerID}`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, uploadedCustomerID)

        // Addresses
        // assert.ok(res.body.default_address.address_1)
        // assert.ok(res.body.default_address.city)
        // assert.ok(res.body.shipping_address.address_1)
        // assert.ok(res.body.shipping_address.city)

        // Accounts (DEPRECATED)
        // assert.equal(res.body.accounts.length, 1)

        done(err)
      })
  })
  it('It should search customer', (done) => {
    adminUser
      .get('/customers/search')
      .query({
        term: 'scott'
      })
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
        assert.ok(res.body)
        done(err)
      })
  })
})
