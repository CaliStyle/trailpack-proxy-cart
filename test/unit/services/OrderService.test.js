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
    Order.resolve(Order.build({}))
      .then(order => {
        assert.ok(order instanceof Order.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should resolve Subscribe Immediately', () => {
    const subscribe = OrderService.resolveSubscribeImmediately([
      {
        kind: 'sale',
        status: 'success'
      },
      {
        kind: 'capture',
        status: 'success'
      }
    ], true)
    assert.equal(subscribe, true)
  })
  it('should not resolve Subscribe Immediately', () => {
    const subscribe = OrderService.resolveSubscribeImmediately([
      {
        kind: 'sale',
        status: 'success'
      },
      {
        kind: 'capture',
        status: 'failure'
      }
    ], true)
    assert.equal(subscribe, false)
  })
  it('should resolve Fulfill Immediately', () => {
    const fulfill = OrderService.resolveSendImmediately([
      {
        kind: 'sale',
        status: 'success'
      },
      {
        kind: 'capture',
        status: 'success'
      }
    ], 'immediate')
    assert.equal(fulfill, true)
  })
  it('should not resolve Fulfill Immediately', () => {
    const fulfill = OrderService.resolveSendImmediately([
      {
        kind: 'sale',
        status: 'success'
      },
      {
        kind: 'capture',
        status: 'failure'
      }
    ], 'immediate')
    assert.equal(fulfill, false)
  })
  it('should not resolve Fulfill Immediately', () => {
    const fulfill = OrderService.resolveSendImmediately([
      {
        kind: 'sale',
        status: 'success'
      },
      {
        kind: 'capture',
        status: 'failure'
      }
    ], 'manual')
    assert.equal(fulfill, false)
  })
})
