'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const collections = require('../../fixtures/collections')

describe('CollectionController', () => {
  let request
  let collectionID
  let uploadID
  before((done) => {
    request = supertest('http://localhost:3000')
    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['CollectionController'])
  })
  it('should create a collection', (done) => {
    const collection = collections[0]
    request
      .post('/collection')
      .send(collection)
      .expect(200)
      .end((err, res) => {
        collectionID = res.body.id
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
        done(err)
      })
  })
  it.skip('should add tag to collection', (done) => {
  })
  it.skip('should remove tag from collection', (done) => {
  })
  it.skip('should add collection to collection', (done) => {
  })
  it.skip('should should remove collection from collection', (done) => {
  })

  it('It should upload collection_upload.csv', (done) => {
    request
      .post('/collection/uploadCSV')
      .attach('csv', 'test/fixtures/collection_upload.csv')
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.collections, 1)
        done()
      })
  })
  it('It should process upload', (done) => {
    request
      .post(`/collection/processUpload/${uploadID}`)
      .send({})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.collections, 1)
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
})
