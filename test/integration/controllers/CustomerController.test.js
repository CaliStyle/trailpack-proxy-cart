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
        console.log('THIS CUSTOMER First',res.body)
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
        console.log('THIS CUSTOMER',res.body)
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
  it.skip('should add tag to customer', (done) => {
  })
  it.skip('should remove tag from customer', (done) => {
  })
  it.skip('should add customer to collection', (done) => {
  })
  it.skip('should should remove customer from collection', (done) => {
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
})
