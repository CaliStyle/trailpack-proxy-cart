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
      // console.log('GLOBAL SHOP', shop)
    })
    .catch(global.app.stop)
})

after(() => {
  return global.app.stop()
})
