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
  let createdVariantID

  it('should get general stats', (done) => {
    request
      .get('/product/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })

  it('should make addProducts post request', (done) => {
    request
      .post('/product/addProducts')
      .send([
        {
          handle: 'snowboard',
          title: 'Burton Custom Freestyle 151',
          body: '<strong>Good snowboard!</strong>',
          vendors: [
            'Burton'
          ],
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
          option: { width: '18in' },
          weight: 20,
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
              option: { size: '44in' },
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
        // console.log('BREAKING', res.body[0])
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
        assert.notEqual(res.body[0].vendors.indexOf('Burton'), -1)
        assert.equal(res.body[0].type, 'Snowboard')
        assert.notEqual(res.body[0].options.indexOf('size'), -1)
        assert.notEqual(res.body[0].options.indexOf('width'), -1)
        // Metadata
        assert.equal(res.body[0].metadata.test, 'value')
        // Collections
        assert.equal(res.body[0].collections.length, 1)
        assert.equal(res.body[0].collections[0].handle, 'fire-sale')
        // Tags
        // assert.equal(res.body[0].tags.length, 3)
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
        assert.equal(res.body[0].variants[0].option.width, '18in')

        assert.equal(res.body[0].variants[1].product_id, createdProductID)
        assert.equal(res.body[0].variants[1].sku, 'board-w-123')
        assert.equal(res.body[0].variants[1].title, 'Women\'s Burton Custom Freestyle 151')
        assert.equal(res.body[0].variants[1].price, '10001')
        assert.equal(res.body[0].variants[1].weight, '20')
        assert.equal(res.body[0].variants[1].weight_unit, 'lb')
        assert.equal(res.body[0].variants[1].option.size, '44in')
        done(err)
      })
  })
  it('should find created product', (done) => {
    request
      .get(`/product/${createdProductID}`)
      .expect(200)
      .end((err, res) => {
        console.log('THIS PRODUCT TAGS', res.body.tags)
        // console.log('THESE COLLECTIONS',res.body.collections)
        // console.log(res.body)
        // Product
        assert.equal(res.body.id, createdProductID)
        assert.equal(res.body.handle, 'snowboard')
        assert.equal(res.body.title, 'Burton Custom Freestyle 151')
        assert.equal(res.body.seo_title, 'Burton Custom Freestyle 151')
        assert.equal(res.body.seo_description, 'Good snowboard!')
        assert.notEqual(res.body.vendors.indexOf('Burton'), -1)
        assert.equal(res.body.type, 'Snowboard')
        // Metadata
        assert.equal(res.body.metadata.test, 'value')
        // Collections
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].handle, 'fire-sale')
        // Tags
        // TODO FIX SO THAT ONLY PRODUCT TAGS ARE RETURNED
        // assert.equal(res.body.tags.length, 3)
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
              title: 'Women\'s Burton Custom Freestyle 151 Updated',
              option: { size: '44in' }
            },
            // Creates new Variant
            {
              title: 'Youth Burton Custom Freestyle 151',
              sku: 'board-y-123',
              option: { size: '36in' },
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
        console.log('SET COLLECTIONS', res.body[0].collections)
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

        // Collections
        console.log('SET COLLECTIONS', res.body.collections)
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].title, 'free-shipping')
        assert.equal(res.body.collections[0].handle, 'free-shipping')
        done(err)
      })
  })
  it('should add tag to product', (done) => {
    request
      .post(`/product/${createdProductID}/addTag/test`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, createdProductID)
        assert.equal(res.body.tags.length, 4)
        assert.notEqual(res.body.tags.indexOf('test'), -1 )
        done(err)
      })
  })

  it('should remove tag to product', (done) => {
    request
      .post(`/product/${createdProductID}/removeTag/test`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        assert.equal(res.body.tags.length, 3)
        assert.equal(res.body.tags.indexOf('test'), -1 )
        done(err)
      })
  })
  // TODO complete test
  it('should add collection to product', (done) => {
    request
      .post(`/product/${createdProductID}/addCollection/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        done(err)
      })
  })
  // TODO complete test
  it('should remove collection from product', (done) => {
    request
      .post(`/product/${createdProductID}/removeCollection/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        done(err)
      })
  })
  // TODO complete test
  it('should add association to product', (done) => {
    request
      .post(`/product/${createdProductID}/addAssociation/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        // assert.equal(res.body.id, createdProductID)
        done(err)
      })
  })
  // TODO complete test
  it('should show associations of product', (done) => {
    request
      .get(`/product/${createdProductID}/associations`)
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        // assert.equal(res.body.length, 1)
        done(err)
      })
  })
  // TODO complete test
  it('should remove association from product', (done) => {
    request
      .post(`/product/${createdProductID}/removeAssociation/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        done(err)
      })
  })
  // TODO complete test
  it('should add shop to product', (done) => {
    request
      .post(`/product/${createdProductID}/addShop/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        done(err)
      })
  })
  // TODO complete test
  it('should remove shop from product', (done) => {
    request
      .post(`/product/${createdProductID}/removeShop/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        done(err)
      })
  })
  // TODO complete test
  it('should add a vendor to product', (done) => {
    request
      .post(`/product/${createdProductID}/addVendor/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        done(err)
      })
  })
  // TODO complete test
  it('should remove a vendor from product', (done) => {
    request
      .post(`/product/${createdProductID}/removeVendor/1`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.equal(res.body.id, createdProductID)
        done(err)
      })
  })
  // TODO complete test
  it('should show reviews of product', (done) => {
    request
      .get(`/product/${createdProductID}/reviews`)
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        // assert.equal(res.body.length, 1)
        done(err)
      })
  })
  it('should make removeImage post request', (done) => {
    request
      .post(`/product/${createdProductID}/image/${firstImageID}/remove`)
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
  it('should make createVariant post request', (done) => {
    request
      .post(`/product/${createdProductID}/variant`)
      .send({
        sku: 'bscb-1',
        title: 'Burton Super Custom Board',
        option: { size: '700in', hover: '1000 feet' },
        price: 100000,
      })
      .expect(200)
      .end((err, res) => {
        createdVariantID = res.body.id
        assert.equal(res.body.product_id, createdProductID)
        assert.equal(res.body.sku, 'bscb-1')
        assert.equal(res.body.price, 100000)
        done(err)
      })
  })
  it('should make updateVariant post request', (done) => {
    request
      .post(`/product/${createdProductID}/variant/${createdVariantID}`)
      .send({
        price: 100001
      })
      .expect(200)
      .end((err, res) => {
        console.log('Updated Variant', res.body)
        assert.equal(res.body.product_id, createdProductID)
        assert.equal(res.body.sku, 'bscb-1')
        assert.equal(res.body.price, 100001)
        done(err)
      })
  })
  it('should make removeVariant post request', (done) => {
    request
      .post(`/product/${createdProductID}/variant/${firstVariantID}/remove`)
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
        assert.equal(res.body.variants.length, 3)
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
      .attach('file', 'test/fixtures/product_upload.csv')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.products, 5)
        assert.equal(res.body.result.errors.length, 1)
        done()
      })
  })
  it('It should process upload', (done) => {
    request
      .post(`/product/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log('BROKE',res.body.errors)
        assert.equal(res.body.products, 2)
        assert.equal(res.body.variants, 5)
        assert.equal(res.body.errors.length, 0)
        done()
      })
  })
  it('It should get product with uploaded association', (done) => {
    request
      .get('/product/handle/yeti')
      .expect(200)
      .end((err, res) => {
        console.log('THIS PRODUCT', res.body)
        done()
      })
  })

  it('It should upload product_meta_upload.csv', (done) => {
    request
      .post('/product/uploadMetaCSV')
      .attach('file', 'test/fixtures/product_meta_upload.csv')
      .expect(200)
      .end((err, res) => {
        console.log('testing',res.body)
        assert.ok(res.body.result.upload_id)
        uploadMetaID = res.body.result.upload_id
        assert.equal(res.body.result.products, 2)
        assert.equal(res.body.result.errors.length, 1)
        done()
      })
  })
  it('It should process meta upload', (done) => {
    request
      .post(`/product/processMetaUpload/${uploadMetaID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        console.log('TESTING',res.body)
        assert.equal(res.body.products, 2)
        done()
      })
  })
  it('It should get product with uploaded meta', (done) => {
    request
      .get('/product/handle/hydroflask')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS PRODUCT', res.body)
        //recycle: 'no', material: 'plastic', condition: 'new'
        assert.equal(res.body.metadata['recycle'], 'no')
        assert.equal(res.body.metadata['material'], 'plastic')
        assert.equal(res.body.metadata['condition'], 'new')
        assert.equal(res.body.metadata['meta']['nested'], true)
        assert.equal(res.body.variants[0].metadata['material'], 'metal')
        assert.equal(res.body.variants[0].metadata['condition'], 'used')
        assert.equal(res.body.variants[0].metadata['recycle'], 'no')
        done()
      })
  })

  it('It should get products', (done) => {
    request
      .get('/product')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
        assert.ok(res.headers['x-pagination-sort'])
        assert.equal(res.headers['x-pagination-total'], '7')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-sort'], 'created_at DESC')
        assert.ok(res.body)
        done()
      })
  })
  it('It should get products by tag', (done) => {
    request
      .get('/product/tag/flask')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.equal(res.headers['x-pagination-total'], '2')
        assert.equal(res.body.length, 2)
        done()
      })
  })
  it('It should get products by collection', (done) => {
    request
      .get('/product/collection/bottles')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.equal(res.headers['x-pagination-total'], '2')
        assert.equal(res.body.length, 2)
        done()
      })
  })
  it('It should get product by handle', (done) => {
    request
      .get('/product/handle/discount-test')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS DISCOUNT TEST', res.body)
        assert.ok(res.body)
        assert.equal(res.body.handle, 'discount-test')
        done()
      })
  })
  it('It should search and get product', (done) => {
    request
      .get('/product/search?term=Hydro')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.equal(res.body.length, 1)
        assert.equal(res.headers['x-pagination-total'], '1')
        done()
      })
  })
  // TEST LARGE UPLOAD
  // it('It should upload product_upload_staging.csv', (done) => {
  //   request
  //     .post('/product/uploadCSV')
  //     .attach('csv', 'test/fixtures/product_upload_staging.csv')
  //     .expect(200)
  //     .end((err, res) => {
  //       assert.ok(res.body.result.upload_id)
  //       uploadID = res.body.result.upload_id
  //       assert.equal(res.body.result.products, 338)
  //       done()
  //     })
  // })
  // it('It should process upload', (done) => {
  //   request
  //     .post(`/product/processUpload/${uploadID}`)
  //     .send({})
  //     .expect(200)
  //     .end((err, res) => {
  //       assert.equal(res.body.products, 32)
  //       assert.equal(res.body.variants, 319)
  //       done()
  //     })
  // })
})
