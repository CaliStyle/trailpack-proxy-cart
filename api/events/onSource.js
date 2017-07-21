/* eslint no-console: [0] */
'use strict'

const Event = require('trailpack-proxy-engine').Event

module.exports = class onSource extends Event {
  subscribe() {
    this.app.services.ProxyEngineService.subscribe('onSource.created','customer.source.created', this.created)
    this.app.services.ProxyEngineService.subscribe('onSource.updated','customer.source.updated', this.updated)
  }
  created(msg, data) {
    // this.app.log.debug('onSource.created', msg)
    // // try and fix broken/failed transactions
    // this.app.services.AccountService.sourceRetryTransactions(data.data)
    //   .catch(err => {
    //     this.app.log.error(err)
    //   })
  }
  updated(msg, data) {
    // this.app.log.debug('onSource.updated', msg)
    // try and fix broken/failed transactions
    this.app.services.AccountService.sourceRetryTransactions(data.data)
      .catch(err => {
        this.app.log.error(err)
      })
  }
}
