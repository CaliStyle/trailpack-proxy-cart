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
