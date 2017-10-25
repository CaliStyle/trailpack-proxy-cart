'use strict'
/* global describe, it */
const assert = require('assert')

describe('ProductService', () => {
  let ProductService
  let Product
  let Variant
  it('should exist', () => {
    assert(global.app.api.services['ProductService'])
    ProductService = global.app.services['ProductService']
    Product = global.app.services.ProxyEngineService.getModel('Product')
    Variant = global.app.services.ProxyEngineService.getModel('ProductVariant')
  })
  it('should resolve a product instance', (done) => {
    Product.resolve(Product.build({}))
      .then(product => {
        assert.ok(product instanceof Product)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should resolve a variant instance', (done) => {
    Variant.resolve(Variant.build({}))
      .then(variant => {
        assert.ok(variant instanceof Variant)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
