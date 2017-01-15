'use strict'
/* global describe, it */
const assert = require('assert')

describe('OrderService', () => {
  let OrderService
  let Order
  it('should exist', () => {
    assert(global.app.api.services['OrderService'])
    OrderService = global.app.services['OrderService']
    Order = global.app.services.ProxyEngineService.getModel('Order')
  })
  it('should resolve an order instance', (done) => {
    OrderService.resolve(Order.build({}))
      .then(order => {
        assert.ok(order instanceof Order.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
