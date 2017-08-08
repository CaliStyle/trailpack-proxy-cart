'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const collections = require('../../fixtures/collections')

describe('CollectionController', () => {
  let request
  let collectionID
  let collection2ID
  let uploadID
  before((done) => {
    request = supertest('http://localhost:3000')
    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['CollectionController'])
  })
  it('should get general stats', (done) => {
    request
      .get('/collection/generalStats')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        done(err)
      })
  })
  it('should create a collection', (done) => {
    const collection = collections[0]
    request
      .post('/collection')
      .send(collection)
      .expect(200)
      .end((err, res) => {
        collectionID = res.body.id
        console.log('this collection', res.body)
        assert.equal(res.body.handle, 'have-you-seen-my-pants')
        assert.equal(res.body.title, 'Have you seen my Pants?')
        assert.equal(res.body.body, '# Honey, have you seen my Pants?')
        assert.equal(res.body.html, '<h1>Honey, have you seen my Pants?</h1>\n')
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].handle, 'lego-movie')
        assert.equal(res.body.collections[0].title, 'Lego Movie')
        assert.equal(res.body.images.length, 2)
        done(err)
      })
  })
  it('should create another collection', (done) => {
    const collection = collections[1]
    request
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
    request
      .get(`/collection/${collectionID}`)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.handle, 'have-you-seen-my-pants')
        assert.equal(res.body.title, 'Have you seen my Pants?')
        assert.equal(res.body.body, '# Honey, have you seen my Pants?')
        assert.equal(res.body.html, '<h1>Honey, have you seen my Pants?</h1>\n')
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].handle, 'lego-movie')
        assert.equal(res.body.collections[0].title, 'Lego Movie')
        assert.equal(res.body.images.length, 2)
        done(err)
      })
  })
  it('should update collection', (done) => {
    request
      .post(`/collection/${collectionID}`)
      .send({
        title: 'Have you seen my Pants? Again?',
        body: '# Honey, have you seen my Pants? Again?'
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.handle, 'have-you-seen-my-pants')
        assert.equal(res.body.title, 'Have you seen my Pants? Again?')
        assert.equal(res.body.body, '# Honey, have you seen my Pants? Again?')
        assert.equal(res.body.html, '<h1>Honey, have you seen my Pants? Again?</h1>\n')
        assert.equal(res.body.collections.length, 1)
        assert.equal(res.body.collections[0].handle, 'lego-movie')
        assert.equal(res.body.collections[0].title, 'Lego Movie')
        assert.equal(res.body.images.length, 2)
        done(err)
      })
  })
  // TODO complete test
  it('should add tag to collection', (done) => {
    request
      .post(`/collection/${collectionID}/addTag/test`)
      .send()
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.id, collectionID)
        done(err)
      })
  })
  // TODO complete test
  it('should list tags of a collection', (done) => {
    request
      .get(`/collection/${collectionID}/tags`)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION TAGS',res.body)
        assert.ok(res.body)
        done(err)
      })
  })
  // TODO complete test
  it('should remove tag from collection', (done) => {
    request
      .post(`/collection/${collectionID}/removeTag/test`)
      .send()
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.id, collectionID)
        done(err)
      })
  })
  // TODO complete test
  it('should add product to collection', (done) => {
    request
      .post(`/collection/${collectionID}/addProduct/1`)
      .send()
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.id, collectionID)
        done(err)
      })
  })
  // TODO complete test
  it('should list collection products', (done) => {
    request
      .get(`/collection/${collectionID}/products`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        // console.log('THIS COLLECTION',res.body)
        assert.ok(res.body)
        done(err)
      })
  })
  // TODO complete test
  it('should remove product from collection', (done) => {
    request
      .post(`/collection/${collectionID}/removeProduct/1`)
      .send()
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.id, collectionID)
        done(err)
      })
  })
  // TODO complete test
  it('should add customer to collection', (done) => {
    request
      .post(`/collection/${collectionID}/addCustomer/1`)
      .send()
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.id, collectionID)
        done(err)
      })
  })
  // TODO complete test
  it('should list collection customers', (done) => {
    request
      .get(`/collection/${collectionID}/customers`)
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        // console.log('THIS COLLECTION',res.body)
        assert.ok(res.body)
        done(err)
      })
  })
  // TODO complete test
  it('should remove customer from collection', (done) => {
    request
      .post(`/collection/${collectionID}/addCustomer/1`)
      .send()
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.id, collectionID)
        done(err)
      })
  })
  it('should add collection to collection', (done) => {
    request
      .post(`/collection/${collectionID}/collection/${collection2ID}`)
      .send()
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.collections.length, 2)
        done(err)
      })
  })
  // TODO complete test
  it('should list collection collections', (done) => {
    request
      .get(`/collection/${collectionID}/collections`)
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        // assert.equal(res.body.length, 2)
        done(err)
      })
  })
  it('should should remove collection from collection', (done) => {
    request
      .del(`/collection/${collectionID}/collection/${collection2ID}`)
      .send()
      .expect(200)
      .end((err, res) => {
        // console.log('THIS COLLECTION',res.body)
        assert.equal(res.body.collections.length, 1)
        done(err)
      })
  })

  it('It should upload collection_upload.csv', (done) => {
    request
      .post('/collection/uploadCSV')
      .attach('file', 'test/fixtures/collection_upload.csv')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.collections, 1)
        assert.equal(res.body.result.errors_count, 0)
        done()
      })
  })
  it('It should process upload', (done) => {
    request
      .post(`/collection/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        console.log('COLLECTION UPLOAD',res.body)
        assert.equal(res.body.collections, 1)
        assert.equal(res.body.errors_count, 0)
        done()
      })
  })
  it('It should get collection by handle', (done) => {
    request
      .get('/collection/handle/awesome')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body)
        assert.equal(res.body.handle, 'awesome')
        assert.equal(res.body.discount_scope, 'global')
        assert.equal(res.body.discount_type, 'fixed')
        assert.equal(res.body.discount_rate, 100)
        done()
      })
  })
  it('It should search a collection', (done) => {
    request
      .get('/collection/search')
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
        assert.equal(res.body.length, 1)
        done()
      })
  })
})
