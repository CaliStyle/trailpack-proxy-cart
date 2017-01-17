'use strict'

const TrailsApp = require('trails')
const assert = require('assert')
const supertest = require('supertest')

before(() => {
  global.app = new TrailsApp(require('./app'))
  // return global.app.start().catch(global.app.stop)
  return global.app.start()
    .then(() => {
      return global.app.services.ShopService.create({
        name: 'Test Shop',
        host: 'localhost',
        address: {
          address_1: '1 Infinite Loop',
          city: 'Cupertino',
          province: 'California',
          country: 'United States',
          postal_code: '95014'
        }
      })
    })
    .then(shop => {
      global.app.shopID = shop.id
      let products = require('./fixtures/products')
      products = products.map( product => {
        product.shops = [{id: shop.id}]
        return product
      })
      return global.app.services.ProductService.addProducts(products)
    })
    .then(products => {
      products = products.map(product => {
        return product.get({plain: true})
      })
      global.app.shopProducts = products
    })
    .catch(global.app.stop)
})

after(() => {
  return global.app.stop()
})
