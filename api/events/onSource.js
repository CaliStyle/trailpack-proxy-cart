/* eslint no-console: [0] */
'use strict'

const Event = require('trailpack-proxy-engine').Event

module.exports = class onSource extends Event {
  subscribe() {
    this.app.services.ProxyEngineService.subscribe('onSource.created','customer.source.created', this.created)
    this.app.services.ProxyEngineService.subscribe('onSource.updated','customer.source.updated', this.updated)
  }
  created(msg, data) {
    // console.log('onSource.created', msg, data)
    // try and fix broken/failed transactions

  }
  updated(msg, data) {
    // console.log('onSource.updated', msg, data)
    // try and fix broken/failed transactions
  }
}
