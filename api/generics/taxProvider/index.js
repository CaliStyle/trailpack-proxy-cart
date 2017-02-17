'use strict'
// const _ = require('lodash')
module.exports = class DefaultTaxProvider {
  constructor(options) {
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
