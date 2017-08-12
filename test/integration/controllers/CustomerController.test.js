'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const customers = require('../../fixtures/customers')

describe('CustomerController', () => {
  let request
  let customerID
  let addressID
  let uploadID
  before((done) => {
    request = supertest('http://localhost:3000')
    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['CustomerController'])
  })
  it('should get general stats', (done) => {
    request
      .get('/customer/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should create a customer with a default address', (done) => {
    const customer = customers[1]
    request
      .post('/customer')
      .send(customer)
      .expect(200)
      .end((err, res) => {
        customerID = res.body.id
        done(err)
      })
  })
  it('should find created customer', (done) => {
    request
      .get(`/customer/${customerID}`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, 'Scottie')
        assert.equal(res.body.last_name, 'Wyatt')
        assert.equal(res.body.metadata.test, 'value')
        done(err)
      })
  })
  it('should update customer', (done) => {
    request
      .post(`/customer/${customerID}`)
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
    request
      .post(`/customer/${customerID}/address`)
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
        // console.log('THIS ADDRESS',res.body)
        addressID = res.body.id
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        assert.equal(res.body.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.address_2, '')
        assert.equal(res.body.company, 'Shipping Department')
        assert.equal(res.body.city, 'Washington')
        assert.equal(res.body.phone, '')
        assert.equal(res.body.province_code, 'DC')
        assert.equal(res.body.country_code, 'US')
        assert.equal(res.body.postal_code, '20500')
        done(err)
      })
  })
  it('should update customer address', (done) => {
    request
      .post(`/customer/${customerID}/address/${addressID}`)
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
        assert.equal(res.body.address_2, '')
        assert.equal(res.body.company, 'Billing Department')
        assert.equal(res.body.city, 'Washington')
        assert.equal(res.body.phone, '')
        assert.equal(res.body.province_code, 'DC')
        assert.equal(res.body.country_code, 'US')
        assert.equal(res.body.postal_code, '20500')
        done(err)
      })
  })
  it('should update customer and set as shipping address', (done) => {
    request
      .post(`/customer/${customerID}/address/${addressID}`)
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
        assert.equal(res.body.address_2, '')
        assert.equal(res.body.company, 'Billing Department')
        assert.equal(res.body.city, 'Washington')
        assert.equal(res.body.phone, '')
        assert.equal(res.body.province_code, 'DC')
        assert.equal(res.body.country_code, 'US')
        assert.equal(res.body.postal_code, '20500')
        done(err)
      })
  })
  it('should get customer addresses', (done) => {
    request
      .get(`/customer/${customerID}/addresses`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
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
    request
      .delete(`/customer/${customerID}/address/${addressID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        assert.equal(res.body.address_1, '1600 Pennsylvania Ave NW')
        assert.equal(res.body.address_2, '')
        assert.equal(res.body.company, 'Billing Department')
        assert.equal(res.body.city, 'Washington')
        assert.equal(res.body.phone, '')
        assert.equal(res.body.province_code, 'DC')
        assert.equal(res.body.country_code, 'US')
        assert.equal(res.body.postal_code, '20500')
        done(err)
      })
  })
  // TODO Complete Test
  it('should add tag to customer', (done) => {
    request
      .post(`/customer/${customerID}/addTag/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })
  // TODO Complete Test
  it('should remove tag from customer', (done) => {
    request
      .post(`/customer/${customerID}/removeTag/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })
  // TODO Complete Test
  it('should add customer to collection', (done) => {
    request
      .post(`/customer/${customerID}/addCollection/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })
  // TODO Complete Test
  it('should should remove customer from collection', (done) => {
    request
      .post(`/customer/${customerID}/removeCollection/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // TODO
        done(err)
      })
  })

  it('It should upload customer_upload.csv', (done) => {
    request
      .post('/customer/uploadCSV')
      .attach('file', 'test/fixtures/customer_upload.csv')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.customers, 2)
        done()
      })
  })
  it('It should process upload', (done) => {
    request
      .post(`/customer/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.customers, 2)
        done()
      })
  })
  it('It should get customers', (done) => {
    request
      .get('/customer')
      .expect(200)
      .end((err, res) => {
        // console.log('UPLOADED CUSTOMER', res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
        // assert.equal(res.headers['x-pagination-total'], '2')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.ok(res.body)
        // Most Freshly added customer
        customerID = res.body[1].id
        done()
      })
  })
  it('It should find uploaded customer', (done) => {
    request
      .get(`/customer/${customerID}`)
      .expect(200)
      .end((err, res) => {
        // console.log('UPLOADED CUSTOMER', res.body)
        assert.equal(res.body.id, customerID)
        assert.ok(res.body.default_address.address_1)
        assert.ok(res.body.default_address.city)
        assert.ok(res.body.shipping_address.address_1)
        assert.ok(res.body.shipping_address.city)

        assert.equal(res.body.accounts.length, 1)

        done()
      })
  })
  it('It should search customer', (done) => {
    request
      .get('/customer/search')
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
        // assert.equal(res.headers['x-pagination-total'], '2')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.ok(res.body)
        // assert.equal(res.body.length, 1)
        done()
      })
  })
})
