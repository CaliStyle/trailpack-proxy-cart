'use strict'
// const _ = require('lodash')
const Generic = require('trailpack-proxy-generics').Generic
module.exports = class FakeGeolocationProvider extends Generic{
  constructor(options) {
    super()
    this.options = options
  }

  locate(data) {
    return Promise.resolve({
      latitude: 0.000000,
      longitude: 0.000000
    })
  }
}
