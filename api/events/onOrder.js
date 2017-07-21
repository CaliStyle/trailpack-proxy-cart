/* eslint no-console: [0] */
'use strict'

const Event = require('trailpack-proxy-engine').Event

module.exports = class onOrder extends Event {
  subscribe() {
    // this.app.services.ProxyEngineService.subscribe('onOrder.fulfilled', 'order.fulfillment.fulfilled', this.fulfilled)
    // this.app.services.ProxyEngineService.subscribe('onOrder.updated', 'customer.order.updated', this.updated)
  }
}
