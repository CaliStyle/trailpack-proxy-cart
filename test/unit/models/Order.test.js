'use strict'
/* global describe, it */
const assert = require('assert')

describe('Order Model', () => {
  let Order, Transaction
  it('should exist', () => {
    assert(global.app.api.models['Order'])
    Order = global.app.orm['Order']
    Transaction = global.app.orm['Transaction']
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
  it('should resolve Subscribe Immediately', (done) => {
    const resOrder = Order.build({
      fulfillment_kind: 'immediate',
      has_subscription: true,
      total_price: 10
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      }]
    })
    resOrder.set('transactions', [
      {
        kind: 'sale',
        status: 'success',
        amount: 5
      },
      {
        kind: 'capture',
        status: 'success',
        amount: 5
      }
    ])
    resOrder.resolveSubscribeImmediately()
      .then(subscribe => {
        assert.equal(subscribe, true)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should not resolve Subscribe Immediately', (done) => {
    const resOrder = Order.build({
      fulfillment_kind: 'immediate',
      has_subscription: true,
      total_price: 10
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      }]
    })
    resOrder.set('transactions', [
      {
        kind: 'sale',
        status: 'success',
        amount: 5
      },
      {
        kind: 'capture',
        status: 'failure',
        amount: 5
      }
    ])
    resOrder.resolveSubscribeImmediately()
      .then(subscribe => {
        assert.equal(subscribe, false)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should resolve Fulfill Immediately', (done) => {
    const resOrder = Order.build({
      fulfillment_kind: 'immediate',
      total_price: 10
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      }]
    })
    resOrder.set('transactions', [
      {
        kind: 'sale',
        status: 'success',
        amount: 5
      },
      {
        kind: 'capture',
        status: 'success',
        amount: 5
      }
    ])
    resOrder.resolveSendImmediately()
      .then(subscribe => {
        assert.equal(subscribe, true)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should not resolve Fulfill Immediately because of failure', (done) => {
    const resOrder = Order.build({
      fulfillment_kind: 'immediate',
      total_price: 10
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      }]
    })
    resOrder.set('transactions', [
      {
        kind: 'sale',
        status: 'success',
        amount: 5
      },
      {
        kind: 'capture',
        status: 'failure',
        amount: 5
      }
    ])
    resOrder.resolveSendImmediately()
      .then(subscribe => {
        assert.equal(subscribe, false)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should not resolve Fulfill Immediately because of manual', (done) => {
    const resOrder = Order.build({
      fulfillment_kind: 'manual',
      total_price: 10
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      }]
    })
    resOrder.set('transactions', [
      {
        kind: 'sale',
        status: 'success',
        amount: 5
      },
      {
        kind: 'capture',
        status: 'success',
        amount: 5
      }
    ])
    resOrder.resolveSendImmediately()
      .then(subscribe => {
        assert.equal(subscribe, false)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should not resolve Fulfill Immediately because of manual and failure', (done) => {
    const resOrder = Order.build({
      fulfillment_kind: 'manual',
      total_price: 10
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      }]
    })
    resOrder.set('transactions', [
      {
        kind: 'sale',
        status: 'success',
        amount: 5
      },
      {
        kind: 'capture',
        status: 'failure',
        amount: 5
      }
    ])
    resOrder.resolveSendImmediately()
      .then(subscribe => {
        assert.equal(subscribe, false)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
