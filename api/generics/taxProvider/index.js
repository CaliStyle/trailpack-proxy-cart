'use strict'
// const _ = require('lodash')
module.exports = class DefaultTaxProvider {
  constructor(options) {
    this.options = options
  }
  getRate(data) {
    return Promise.resolve({
      amount: 1000,
      rate: 0.075,
      title: 'Sales Tax',
      tax_details: {}
    })
  }
}
