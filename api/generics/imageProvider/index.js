'use strict'
// const _ = require('lodash')
const Generic = require('trailpack-proxy-generics').Generic
module.exports = class DefaultImageProvider extends Generic {
  constructor(options) {
    super()
    this.options = options
  }
}
