/* eslint no-console: [0] */
'use strict'

const Event = require('trailpack-proxy-engine').Event

module.exports = class onOrder extends Event {
  subscribe() {
    // this.app.services.ProxyEngineService.subscribe('onOrder.fulfilled', 'order.fulfillment_status.fulfilled', this.fulfilled)
    // this.app.services.ProxyEngineService.subscribe('onOrder.updated', 'customer.order.updated', this.updated)
  }
  // fulfilled(msg, data, options) {
  //   // console.log('LOOK AT ME', data, options)
  //   return this.app.orm['Order'].findById(data.object_id, {transaction: options.transaction || null})
  //     .then(foundOrder => {
  //       console.log('Found Order', foundOrder)
  //     })
  // }
}
