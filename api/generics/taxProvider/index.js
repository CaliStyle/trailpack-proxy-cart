'use strict'
// const _ = require('lodash')
const Generic = require('trailpack-proxy-generics').Generic
module.exports = class DefaultTaxProvider extends Generic {
  constructor(options) {
    super()
    this.options = options
  }
  getRate(data) {
    return Promise.resolve({
      amount: 0,
      rate: 0.0,
      title: 'Sales Tax',
      tax_details: {}
    })
  }
}
