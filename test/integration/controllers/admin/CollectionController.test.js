'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _  = require('lodash')
const collections = require('../../../fixtures/collections')

describe('Admin User CollectionController', () => {
  let adminUser, userID, customerID, uploadID, collectionID, collection2ID

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
    assert(global.app.api.controllers['CollectionController'])
  })
  it('should get general stats', (done) => {
    adminUser
      .get('/collection/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should create a collection', (done) => {
    const collection = collections[0]
    adminUser
      .post('/collection')
      .send(collection)
      .expect(200)
      .end((err, res) => {
        collectionID = res.body.id
        assert.equal(res.body.handle, 'have-you-seen-my-pants')
        assert.equal(res.body.title, 'Have you seen my Pants?')
        assert.equal(res.body.excerpt, '# Lego Movie is so funny!')
        assert.equal(res.body.excerpt_html, '<h1>Lego Movie is so funny!</h1>\n')
        assert.equal(res.body.body, '# Honey, have you seen my Pants?')
        assert.equal(res.body.body_html, '<h1>Honey, have you seen my Pants?</h1>\n')
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].handle, 'lego-movie')
        assert.equal(res.body.collections[0].title, 'Lego Movie')
        assert.equal(res.body.images.length, 2)
        // console.log('COLLECTION IMAGES', res.body.images.length)
        done(err)
      })
  })
  it('should create another collection', (done) => {
    const collection = collections[1]
    adminUser
      .post('/collection')
      .send(collection)
      .expect(200)
      .end((err, res) => {
        collection2ID = res.body.id
        assert.equal(res.body.handle, 'customer-discount-test')
        assert.equal(res.body.title, 'Customer Discount')
        assert.equal(res.body.body, '# Customer Discount')
        assert.equal(res.body.collections.length, 0)
        done(err)
      })
  })
  it('should find created collection', (done) => {
    adminUser
      .get(`/collection/${collectionID}`)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.handle, 'have-you-seen-my-pants')
        assert.equal(res.body.title, 'Have you seen my Pants?')
        assert.equal(res.body.excerpt, '# Lego Movie is so funny!')
        assert.equal(res.body.excerpt_html, '<h1>Lego Movie is so funny!</h1>\n')
        assert.equal(res.body.body, '# Honey, have you seen my Pants?')
        assert.equal(res.body.body_html, '<h1>Honey, have you seen my Pants?</h1>\n')
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].handle, 'lego-movie')
        assert.equal(res.body.collections[0].title, 'Lego Movie')
        assert.equal(res.body.images.length, 2)
        done(err)
      })
  })
  it('should update collection', (done) => {
    adminUser
      .post(`/collection/${collectionID}`)
      .send({
        title: 'Have you seen my Pants? Again?',
        body: '# Honey, have you seen my Pants? Again?',
        excerpt: '# Lego Batman Movie is so funny!'
      })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.handle, 'have-you-seen-my-pants')
        assert.equal(res.body.excerpt, '# Lego Batman Movie is so funny!')
        assert.equal(res.body.excerpt_html, '<h1>Lego Batman Movie is so funny!</h1>\n')
        assert.equal(res.body.title, 'Have you seen my Pants? Again?')
        assert.equal(res.body.body, '# Honey, have you seen my Pants? Again?')
        assert.equal(res.body.body_html, '<h1>Honey, have you seen my Pants? Again?</h1>\n')
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].handle, 'lego-movie')
        assert.equal(res.body.collections[0].title, 'Lego Movie')
        assert.equal(res.body.images.length, 2)
        done(err)
      })
  })
  // TODO complete test
  it('should add tag to collection', (done) => {
    adminUser
      .post(`/collection/${collectionID}/addTag/test`)
      .send()
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, collectionID)
        done(err)
      })
  })
  // TODO complete test
  it('should list tags of a collection', (done) => {
    adminUser
      .get(`/collection/${collectionID}/tags`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])
        assert.equal(res.headers['x-pagination-total'], '1')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.ok(res.body)
        done(err)
      })
  })
  // TODO complete test
  it('should remove tag from collection', (done) => {
    adminUser
      .post(`/collection/${collectionID}/removeTag/test`)
      .send()
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, collectionID)
        done(err)
      })
  })
  // TODO complete test
  it('should add product to collection', (done) => {
    adminUser
      .post(`/collection/${collectionID}/addProduct/1`)
      .send()
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, 1)
        done(err)
      })
  })
  // TODO complete test
  it('should list collection products', (done) => {
    adminUser
      .get(`/collection/${collectionID}/products`)
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

        assert.equal(res.headers['x-pagination-total'], '1')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.ok(res.body)
        assert.equal(res.body.length, 1)
        // console.log('BROKE COLLECTION PRODUCTS', res.body)
        done(err)
      })
  })
  // TODO complete test
  it('should remove product from collection', (done) => {
    adminUser
      .post(`/collection/${collectionID}/removeProduct/1`)
      .send()
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, 1)
        done(err)
      })
  })
  // TODO complete test
  it('should add customer to collection', (done) => {
    adminUser
      .post(`/collection/${collectionID}/addCustomer/${customerID}`)
      .send()
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, customerID)
        done(err)
      })
  })
  // TODO complete test
  it('should list collection customers', (done) => {
    adminUser
      .get(`/collection/${collectionID}/customers`)
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
  // TODO complete test
  it('should remove customer from collection', (done) => {
    adminUser
      .post(`/collection/${collectionID}/removeCustomer/${customerID}`)
      .send()
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, customerID)
        done(err)
      })
  })
  it('should add collection to collection', (done) => {
    adminUser
      .put(`/collection/${collectionID}/collection/${collection2ID}`)
      .send()
      .expect(200)
      .end((err, res) => {
        console.log(`added ${collection2ID} to ${collectionID}`)
        assert.equal(res.body.id, collection2ID)
        done(err)
      })
  })
  it('should add collections to collection', (done) => {
    adminUser
      .put(`/collection/${collectionID}/collections`)
      .send([
        {id: 1},
        {id: collection2ID}
      ])
      .expect(200)
      .end((err, res) => {
        // assert.equal(res.body.collections.length, 2)
        assert.equal(res.body.length, 2)
        done(err)
      })
  })
  // TODO complete test
  it('should list collection collections', (done) => {
    adminUser
      .get(`/collection/${collectionID}/collections`)
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
        console.log('BROKE COLLECTIONS COLLECTIONS', res.body)
        assert.equal(res.body.length, 3)
        done(err)
      })
  })
  // it('should should remove collection from collection', (done) => {
  //   adminUser
  //     .del(`/collection/${collectionID}/collection/${collection2ID}`)
  //     .send()
  //     .expect(200)
  //     .end((err, res) => {
  //       assert.equal(res.body.id, collection2ID)
  //       done(err)
  //     })
  // })

  it('It should upload collection_upload.csv', (done) => {
    adminUser
      .post('/collection/uploadCSV')
      .attach('file', 'test/fixtures/collection_upload.csv')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.collections, 1)
        assert.equal(res.body.result.errors_count, 0)
        done(err)
      })
  })
  it('It should process upload', (done) => {
    adminUser
      .post(`/collection/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.collections, 1)
        assert.equal(res.body.errors_count, 0)
        done(err)
      })
  })
  it('It should get collection by handle', (done) => {
    adminUser
      .get('/collection/handle/awesome')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.equal(res.body.handle, 'awesome')
        assert.equal(res.body.title, 'Awesome')
        assert.equal(res.body.description, 'Test Description')
        assert.equal(res.body.excerpt, 'When you\'re part of a team')
        assert.equal(res.body.excerpt_html, "<p>When you're part of a team</p>\n")
        assert.equal(res.body.body, 'Everything is Awesome')
        assert.equal(res.body.body_html, '<p>Everything is Awesome</p>\n')
        assert.equal(res.body.sort_order, 'price-asc')
        // DISCOUNTS MIGRATED TO THEIR OWN OBJECT
        // assert.equal(res.body.discount_scope, 'global')
        // assert.equal(res.body.discount_type, 'fixed')
        // assert.equal(res.body.discount_rate, 100)
        done(err)
      })
  })
  it('should get all collections', (done) => {
    adminUser
      .get('/collections')
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
  it('It should search a collection', (done) => {
    adminUser
      .get('/collections/search')
      .query({
        term: 'Pants'
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
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

        // assert.equal(res.headers['x-pagination-total'], '1')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.equal(res.body.length, 1)
        done(err)
      })
  })
})
