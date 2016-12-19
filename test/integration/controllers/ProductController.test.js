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
  let defaultVariantID
  let firstVariantID
  let firstImageID
  it('should make addProducts post request', (done) => {
    request
      .post('/product/addProducts')
      .send([
        {
          handle: 'snowboard',
          title: 'Burton Custom Freestyle 151',
          body: '<strong>Good snowboard!</strong>',
          vendor: 'Burton',
          type: 'Snowboard',
          price: '10000',
          published: true,
          tags: [
            'snow',
            'equipment',
            'outdoor'
          ],
          sku: 'board-m-123',
          images: [
            {
              src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
              alt: 'Hello World'
            }
          ],
          variants: [
            {
              title: 'Women\'s Burton Custom Freestyle 151',
              price: '10001',
              sku: 'board-w-123',
              images: [
                {
                  src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
                  alt: 'Hello World 2'
                }
              ]
            }
          ]
        }
      ])
      .expect(200)
      .end((err, res) => {
        // console.log('PRODUCT Variants',res.body[0].variants)
        // console.log('PRODUCT Images',res.body[0].images)
        createdProductID = res.body[0].id
        defaultVariantID = res.body[0].variants[0].id
        firstVariantID = res.body[0].variants[1].id
        firstImageID = res.body[0].images[0].id
        // Product
        assert.ok(createdProductID)
        assert.equal(res.body[0].handle, 'snowboard')
        assert.equal(res.body[0].title, 'Burton Custom Freestyle 151')
        assert.equal(res.body[0].vendor, 'Burton')
        assert.equal(res.body[0].type, 'Snowboard')
        // Images
        assert.equal(res.body[0].images[0].position, 1)
        assert.equal(res.body[0].images[0].product_id, createdProductID)
        assert.equal(res.body[0].images[0].product_variant_id, defaultVariantID)
        assert.ok(res.body[0].images[0].src)
        assert.ok(res.body[0].images[0].full)
        assert.ok(res.body[0].images[0].thumbnail)
        assert.ok(res.body[0].images[0].small)
        assert.ok(res.body[0].images[0].medium)
        assert.ok(res.body[0].images[0].large)
        assert.equal(res.body[0].images[0].alt, 'Hello World')
        // Variants
        assert.equal(res.body[0].variants[0].product_id, createdProductID)
        assert.equal(res.body[0].variants[0].sku, 'board-m-123')
        assert.equal(res.body[0].variants[0].title, res.body[0].title)
        assert.equal(res.body[0].variants[0].price, res.body[0].price)
        assert.equal(res.body[0].variants[0].weight, res.body[0].weight)
        assert.equal(res.body[0].variants[0].weight_unit, res.body[0].weight_unit)

        assert.equal(res.body[0].variants[1].product_id, createdProductID)
        assert.equal(res.body[0].variants[1].sku, 'board-w-123')
        assert.equal(res.body[0].variants[1].title, 'Women\'s Burton Custom Freestyle 151')
        assert.equal(res.body[0].variants[1].price, '10001')
        assert.equal(res.body[0].variants[1].weight, '0')
        assert.equal(res.body[0].variants[1].weight_unit, 'g')
        done(err)
      })
  })
  it('should find created product', (done) => {
    request
      .get(`/product/${createdProductID}`)
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        assert.equal(res.body.handle, 'snowboard')
        assert.equal(res.body.title, 'Burton Custom Freestyle 151')
        assert.equal(res.body.vendor, 'Burton')
        assert.equal(res.body.type, 'Snowboard')
        // Images
        assert.equal(res.body.images[0].product_id, createdProductID)
        assert.equal(res.body.images[0].product_variant_id, defaultVariantID)
        assert.equal(res.body.images[0].position, 1)
        assert.ok(res.body.images[0].src)
        assert.ok(res.body.images[0].full)
        assert.ok(res.body.images[0].thumbnail)
        assert.ok(res.body.images[0].small)
        assert.ok(res.body.images[0].medium)
        assert.ok(res.body.images[0].large)
        assert.equal(res.body.images[0].alt, 'Hello World')

        assert.equal(res.body.images[1].product_id, createdProductID)
        assert.equal(res.body.images[1].product_variant_id, firstVariantID)
        assert.equal(res.body.images[1].position, 2)
        assert.ok(res.body.images[1].src)
        assert.ok(res.body.images[1].full)
        assert.ok(res.body.images[1].thumbnail)
        assert.ok(res.body.images[1].small)
        assert.ok(res.body.images[1].medium)
        assert.ok(res.body.images[1].large)
        assert.equal(res.body.images[1].alt, 'Hello World 2')
        // Variants
        assert.equal(res.body.variants[0].product_id, createdProductID)
        assert.equal(res.body.variants[0].title, res.body.title)
        assert.equal(res.body.variants[0].price, res.body.price)
        assert.equal(res.body.variants[0].weight, res.body.weight)
        assert.equal(res.body.variants[0].weight_unit, res.body.weight_unit)

        assert.equal(res.body.variants[1].product_id, createdProductID)
        assert.equal(res.body.variants[1].title, 'Women\'s Burton Custom Freestyle 151')
        assert.equal(res.body.variants[1].price, '10001')
        assert.equal(res.body.variants[1].weight, '0')
        assert.equal(res.body.variants[1].weight_unit, 'g')

        done(err)
      })
  })
  it('should count products, variants, images', (done) => {
    request
      .get('/product/count')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        done(err)
      })
  })
  it('should make updateProducts post request', (done) => {
    request
      .post('/product/updateProducts')
      .send([
        {
          id: createdProductID,
          title: 'Burton Custom Freestyle 151 Gen 2',
          images: [
            {
              id: firstVariantID,
              alt: 'Hello World 2 Updated'
            },
            {
              src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
              alt: 'Hello World 3'
            }
          ],
          variants: [
            {
              id: firstVariantID,
              title: 'Women\'s Burton Custom Freestyle 151 Updated'
            },
            {
              title: 'Youth Burton Custom Freestyle 151',
              images: [
                {
                  src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
                  alt: 'Hello World 4'
                }
              ]
            }
          ]
        }
      ])
      .expect(200)
      .end((err, res) => {
        console.log(res.body[0])
        assert.equal(res.body[0].id, createdProductID)
        assert.equal(res.body[0].title, 'Burton Custom Freestyle 151 Gen 2')
        assert.equal(res.body[0].variants[0].title, res.body[0].title)

        assert.equal(res.body[0].variants.length, 3)
        assert.equal(res.body[0].images.length, 4)
        done(err)
      })
  })
  it('TODO should find updated product', (done) => {
    request
      .get(`/product/${createdProductID}`)
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        assert.equal(res.body.title, 'Burton Custom Freestyle 151 Gen 2')
        assert.equal(res.body.variants.length, 3)
        assert.equal(res.body.images.length, 4)
        done(err)
      })
  })
  it('should make removeImage post request', (done) => {
    request
      .post(`/product/removeImage/${firstImageID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })
  it('Image should be removed', (done) => {
    request
      .get(`/product/${createdProductID}`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.images.length, 3)
        done(err)
      })
  })
  it('should make removeVariant post request', (done) => {
    request
      .post(`/product/removeVariant/${firstVariantID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        done(err)
      })
  })
  it('Variant and it\'s images should be removed', (done) => {
    request
      .get(`/product/${createdProductID}`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.variants.length, 2)
        assert.equal(res.body.images.length, 2)
        done(err)
      })
  })
  it('should make removeProducts post request', (done) => {
    request
      .post('/product/removeProducts')
      .send([{
        id: createdProductID
      }])
      .expect(200)
      .end((err, res) => {
        done(err)
      })
  })
  it('It should not find the removed product', (done) => {
    request
      .get(`/product/${createdProductID}`)
      .expect(404)
      .end((err, res) => {
        done(err)
      })
  })
})
