'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const customers = require('../../fixtures/customers')

describe('CustomerController', () => {
  let request
  let customerID
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
        // console.log('CUSTOMER',res.body)
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
})
