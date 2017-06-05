'use strict'
/* global describe, it */
const assert = require('assert')

describe('Product Model', () => {
  let Product
  it('should exist', () => {
    assert(global.app.api.services['ProductService'])
    Product = global.app.services.ProxyEngineService.getModel('Product')
    assert(Product)
  })
  it('should resolve a product instance', (done) => {
    Product.resolve(Product.build({}))
      .then(product => {
        assert.ok(product instanceof Product.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
