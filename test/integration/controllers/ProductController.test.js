'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('ProductController', () => {
  let request

  before((done) => {
    request = supertest('http://localhost:3000')
    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['ProductController'])
  })
  let createdProductID
  it('should make addProducts post request', (done) => {
    request
      .post('/product/addProducts')
      .send([
        {
          handle: 'snwbrd',
          title: 'Burton Custom Freestyle 151',
          body: '<strong>Good snowboard!</strong>',
          vendor: 'Burton',
          type: 'Snowboard',
          price: '10000',
          images: [
            {
              src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
              alt: 'Hello World'
            }
          ]
        }
      ])
      .expect(200)
      .end((err, res) => {
        // console.log('PRODUCT Variants',res.body[0].variants)
        // console.log('PRODUCT Images',res.body[0].images)
        createdProductID = res.body[0].id
        // Product
        assert.ok(createdProductID)
        assert.equal(res.body[0].handle, 'snwbrd')
        assert.equal(res.body[0].title, 'Burton Custom Freestyle 151')
        assert.equal(res.body[0].vendor, 'Burton')
        assert.equal(res.body[0].type, 'Snowboard')
        // Images
        assert.equal(res.body[0].images[0].position, 1)
        assert.ok(res.body[0].images[0].src)
        assert.ok(res.body[0].images[0].full)
        assert.ok(res.body[0].images[0].thumbnail)
        assert.ok(res.body[0].images[0].small)
        assert.ok(res.body[0].images[0].medium)
        assert.ok(res.body[0].images[0].large)
        assert.equal(res.body[0].images[0].alt, 'Hello World')
        // Variants
        assert.equal(res.body[0].variants[0].title, res.body[0].title)
        assert.equal(res.body[0].variants[0].price, res.body[0].price)
        assert.equal(res.body[0].variants[0].weight, res.body[0].weight)
        assert.equal(res.body[0].variants[0].weight_unit, res.body[0].weight_unit)
        done(err)
      })
  })

  it('should make updateProducts post request', (done) => {
    request
      .post('/product/updateProducts')
      .send([])
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })

  it('should make removeProducts post request', (done) => {
    request
      .post('/product/removeProducts')
      .send([])
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })
})
