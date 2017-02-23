'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

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
  let uploadID
  let uploadMetaID
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
          collections: [
            'fire sale'
          ],
          metadata: {
            test: 'value'
          },
          sku: 'board-m-123',
          weight: '20',
          weight_unit: 'lb',
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
        // console.log('THESE COLLECTIONS',res.body[0].collections)
        // console.log('THIS METADATA',res.body[0].metadata)
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
        assert.equal(res.body[0].seo_title, 'Burton Custom Freestyle 151')
        assert.equal(res.body[0].seo_description, 'Good snowboard!')
        assert.equal(res.body[0].vendor, 'Burton')
        assert.equal(res.body[0].type, 'Snowboard')
        // Metadata
        assert.equal(res.body[0].metadata.test, 'value')
        // Collections
        assert.equal(res.body[0].collections.length, 1)
        assert.equal(res.body[0].collections[0].handle, 'fire-sale')
        // Tags
        assert.equal(res.body[0].tags.length, 3)
        assert.notEqual(res.body[0].tags.indexOf('snow'), -1)
        assert.notEqual(res.body[0].tags.indexOf('equipment'), -1)
        assert.notEqual(res.body[0].tags.indexOf('outdoor'), -1)
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
        assert.equal(res.body[0].variants.length, 2)
        assert.equal(res.body[0].variants[0].position, 1)
        assert.equal(res.body[0].variants[1].position, 2)

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
        assert.equal(res.body[0].variants[1].weight, '20')
        assert.equal(res.body[0].variants[1].weight_unit, 'lb')
        done(err)
      })
  })
  it('should find created product', (done) => {
    request
      .get(`/product/${createdProductID}`)
      .expect(200)
      .end((err, res) => {
        // console.log('THESE COLLECTIONS',res.body.collections)
        // console.log(res.body)
        // Product
        assert.equal(res.body.id, createdProductID)
        assert.equal(res.body.handle, 'snowboard')
        assert.equal(res.body.title, 'Burton Custom Freestyle 151')
        assert.equal(res.body.seo_title, 'Burton Custom Freestyle 151')
        assert.equal(res.body.seo_description, 'Good snowboard!')
        assert.equal(res.body.vendor, 'Burton')
        assert.equal(res.body.type, 'Snowboard')
        // Metadata
        assert.equal(res.body.metadata.test, 'value')
        // Collections
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].handle, 'fire-sale')
        // Tags
        assert.equal(res.body.tags.length, 3)
        assert.notEqual(res.body.tags.indexOf('snow'), -1)
        assert.notEqual(res.body.tags.indexOf('equipment'), -1)
        assert.notEqual(res.body.tags.indexOf('outdoor'), -1)
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
        assert.equal(res.body.variants.length, 2)
        assert.equal(res.body.variants[0].position, 1)
        assert.equal(res.body.variants[1].position, 2)

        assert.equal(res.body.variants[0].product_id, createdProductID)
        assert.equal(res.body.variants[0].title, res.body.title)
        assert.equal(res.body.variants[0].price, res.body.price)
        assert.equal(res.body.variants[0].weight, res.body.weight)
        assert.equal(res.body.variants[0].weight_unit, res.body.weight_unit)

        assert.equal(res.body.variants[1].product_id, createdProductID)
        assert.equal(res.body.variants[1].title, 'Women\'s Burton Custom Freestyle 151')
        assert.equal(res.body.variants[1].price, '10001')
        assert.equal(res.body.variants[1].weight, res.body.weight)
        assert.equal(res.body.variants[1].weight_unit, res.body.weight_unit)

        done(err)
      })
  })
  it('should count products, variants, images', (done) => {
    request
      .get('/product/count')
      .expect(200)
      .end((err, res) => {
        // console.log('PRODUCTS COUNT',res.body)
        assert.ok(_.isNumber(res.body.products))
        assert.ok(_.isNumber(res.body.variants))
        assert.ok(_.isNumber(res.body.images))
        done(err)
      })
  })
  it('should make updateProducts post request', (done) => {
    request
      .post('/product/updateProducts')
      .send([
        {
          id: createdProductID,
          // Updates Title
          title: 'Burton Custom Freestyle 151 Gen 2',
          // Updates Metdata
          metadata: {
            test: 'new value'
          },
          // Alters collections
          collections: [
            'free-shipping'
          ],
          images: [
            // Updates Image alt Tag
            {
              id: firstVariantID,
              alt: 'Hello World 2 Updated'
            },
            // Creates new Image
            {
              src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
              alt: 'Hello World 3'
            }
          ],
          variants: [
            // Updates Variant
            {
              id: firstVariantID,
              title: 'Women\'s Burton Custom Freestyle 151 Updated'
            },
            // Creates new Variant
            {
              title: 'Youth Burton Custom Freestyle 151',
              sku: 'board-y-123',
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
        // console.log(res.body[0])
        assert.equal(res.body[0].id, createdProductID)
        assert.equal(res.body[0].title, 'Burton Custom Freestyle 151 Gen 2')
        // Metadata
        assert.equal(res.body[0].metadata.test, 'new value')
        // Collections
        assert.equal(res.body[0].collections.length, 1)
        assert.equal(res.body[0].collections[0].title, 'free-shipping')
        assert.equal(res.body[0].collections[0].handle, 'free-shipping')
        // Variants
        assert.equal(res.body[0].variants.length, 3)
        assert.equal(res.body[0].variants[0].position, 1)
        assert.equal(res.body[0].variants[1].position, 2)
        assert.equal(res.body[0].variants[2].position, 3)
        assert.equal(res.body[0].variants[0].title, res.body[0].title)
        assert.equal(res.body[0].variants[2].title, 'Youth Burton Custom Freestyle 151')

        // Images
        assert.equal(res.body[0].images.length, 4)
        assert.equal(res.body[0].images[0].position, 1)
        assert.equal(res.body[0].images[1].position, 2)
        assert.equal(res.body[0].images[2].position, 3)
        assert.equal(res.body[0].images[3].position, 4)
        done(err)
      })
  })
  it('should find updated product', (done) => {
    request
      .get(`/product/${createdProductID}`)
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        assert.equal(res.body.title, 'Burton Custom Freestyle 151 Gen 2')
        // Variants
        assert.equal(res.body.variants.length, 3)
        assert.equal(res.body.variants[0].position, 1)
        assert.equal(res.body.variants[1].position, 2)
        assert.equal(res.body.variants[2].position, 3)
        // Images
        assert.equal(res.body.images.length, 4)
        assert.equal(res.body.images[0].position, 1)
        assert.equal(res.body.images[1].position, 2)
        assert.equal(res.body.images[2].position, 3)
        assert.equal(res.body.images[3].position, 4)
        done(err)
      })
  })
  it.skip('should add tag to product', (done) => {
  })
  it.skip('should remove tag to product', (done) => {
  })
  it.skip('should add collection to product', (done) => {
  })
  it.skip('should remove collection from product', (done) => {
  })
  it.skip('should add association to product', (done) => {
  })
  it.skip('should remove association from product', (done) => {
  })
  it.skip('should add shop to product', (done) => {
  })
  it.skip('should remove shop from product', (done) => {
  })
  it('should make removeImage post request', (done) => {
    request
      .post(`/product/image/${firstImageID}/remove`)
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
      .post(`/product/variant/${firstVariantID}/remove`)
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
  it('It should upload product_upload.csv', (done) => {
    request
      .post('/product/uploadCSV')
      .attach('csv', 'test/fixtures/product_upload.csv')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.products, 2)
        done()
      })
  })
  it('It should process upload', (done) => {
    request
      .post(`/product/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.products, 1)
        assert.equal(res.body.variants, 2)
        done()
      })
  })

  it('It should upload product_meta_upload.csv', (done) => {
    request
      .post('/product/uploadMetaCSV')
      .attach('csv', 'test/fixtures/product_meta_upload.csv')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.body.result.upload_id)
        uploadMetaID = res.body.result.upload_id
        assert.equal(res.body.result.products, 1)
        done()
      })
  })
  it('It should process meta upload', (done) => {
    request
      .post(`/product/processMetaUpload/${uploadMetaID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.products, 1)
        done()
      })
  })

  it('It should get products', (done) => {
    request
      .get('/product')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.count)
        assert.ok(res.body.rows)
        done()
      })
  })
  it('It should get products by tag', (done) => {
    request
      .get('/product/tag/flask')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.body.count)
        assert.ok(res.body.rows)
        // assert.equal(res.body.count, 1)
        // assert.equal(res.body.rows.length, 1)
        done()
      })
  })
  it('It should get products by collection', (done) => {
    request
      .get('/product/collection/bottles')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.count)
        assert.ok(res.body.rows)
        // TODO FIX THIS!
        //assert.equal(res.body.count, 1)
        assert.equal(res.body.rows.length, 1)
        done()
      })
  })
})
