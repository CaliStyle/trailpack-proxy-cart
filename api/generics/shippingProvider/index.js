'use strict'
// const _ = require('lodash')
const Generic = require('trailpack-proxy-generics').Generic
module.exports = class DefaultShippingProvider extends Generic{
  constructor(options) {
    super()
    this.options = options
  }
  validateAddress(data) {
    return Promise.resolve(data)
  }
  getRate(data) {
    return Promise.resolve({})
  }
  getRates(data) {
    return Promise.resolve([])
  }
}
