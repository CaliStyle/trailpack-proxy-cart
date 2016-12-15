/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')

/**
 * @module ProductService
 * @description Product Service
 */
module.exports = class ProductService extends Service {
  addProducts(data) {
    console.log(data)
    return Promise.resolve(data)
  }
  updateProducts(data) {
    return Promise.resolve(data)
  }
  removeProducts(data) {
    return Promise.resolve(data)
  }
}

