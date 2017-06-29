'use strict'
/* global describe, it */
const assert = require('assert')

describe('OrderService', () => {
  let OrderService
  let Order
  it('should exist', () => {
    assert(global.app.api.services['OrderService'])
    // OrderService = global.app.services['OrderService']
    // Order = global.app.services.ProxyEngineService.getModel('Order')
  })
})
