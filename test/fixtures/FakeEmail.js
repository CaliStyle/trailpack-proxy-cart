'use strict'
// const _ = require('lodash')
const Generic = require('trailpack-proxy-generics').Generic
module.exports = class FakeEmailProvider extends Generic {
  constructor(options) {
    super()
    this.options = options
  }
  send(data) {
    const results = data.to.map(receiver => {
      return {
        status: 'success',
        email: receiver.email
      }
    })
    return Promise.resolve(results)
  }

  sendTemplate(data) {
    const results = data.to.map(receiver => {
      return {
        status: 'success',
        email: receiver.email
      }
    })
    return Promise.resolve(results)
  }
}
