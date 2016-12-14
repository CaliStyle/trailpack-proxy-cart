'use strict'

const Service = require('trails/service')

/**
 * @module ProductService
 * @description Product Service
 */
module.exports = class ProductService extends Service {
  addProducts(data) {
    return Promise.resolve(data)
  }
  updateProducts(data) {
    return Promise.resolve(data)
  }
  removeProducts(data) {
    return Promise.resolve(data)
  }
}

