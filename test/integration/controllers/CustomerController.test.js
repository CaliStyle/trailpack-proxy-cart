'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const customers = require('../../fixtures/customers')

describe('CustomerController', () => {
  let request
  let customerID
  let uploadID
  before((done) => {
    request = supertest('http://localhost:3000')
    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['CustomerController'])
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
        // console.log('THIS CUSTOMER First',res.body)
        // console.log('CUSTOMER',res.body)
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
        // console.log('THIS CUSTOMER',res.body)
        assert.equal(res.body.first_name, 'Scotty')
        assert.equal(res.body.last_name, 'W')
        // Tags
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
      .attach('csv', 'test/fixtures/customer_upload.csv')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.customers, 1)
        done()
      })
  })
  it('It should process upload', (done) => {
    request
      .post(`/customer/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.customers, 1)
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
        assert.ok(res.body)
        // Most Freshly added customer
        customerID = res.body[0].id
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
        //console.log('SEARCH CUSTOMER', res.body)
        assert.ok(res.body)
        assert.equal(res.body.length, 1)
        done()
      })
  })
})
