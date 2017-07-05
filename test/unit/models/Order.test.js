'use strict'
/* global describe, it */
const assert = require('assert')

describe('Order Model', () => {
  let Order, OrderItem, Transaction
  it('should exist', () => {
    assert(global.app.api.models['Order'])
    Order = global.app.orm['Order']
    OrderItem = global.app.orm['OrderItem']
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
    resOrder.save()
      .then(() => {
        return resOrder.resolveSendImmediately()
      })
      .then(subscribe => {
        assert.equal(subscribe, true)
        return global.app.orm['Transaction'].destroy({where: {order_id: resOrder.id}})
      })
      .then(() => {
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
    resOrder.save()
      .then(() => {
        return resOrder.resolveSendImmediately()
      })
      .then(subscribe => {
        assert.equal(subscribe, false)
        return global.app.orm['Transaction'].destroy({where: {order_id: resOrder.id}})
      })
      .then(() => {
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
    resOrder.save()
      .then(() => {
        return resOrder.resolveSendImmediately()
      })
      .then(subscribe => {
        assert.equal(subscribe, true)
        return global.app.orm['Transaction'].destroy({where: {order_id: resOrder.id}})
      })
      .then(() => {
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
    resOrder.save()
      .then(() => {
        return resOrder.resolveSendImmediately()
      })
      .then(subscribe => {
        assert.equal(subscribe, false)
        return global.app.orm['Transaction'].destroy({where: {order_id: resOrder.id}})
      })
      .then(() => {
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
    resOrder.save()
      .then(() => {
        return resOrder.resolveSendImmediately()
      })
      .then(subscribe => {
        assert.equal(subscribe, false)
        return global.app.orm['Transaction'].destroy({where: {order_id: resOrder.id}})
      })
      .then(() => {
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
    resOrder.save()
      .then(() => {
        return resOrder.resolveSendImmediately()
      })
      .then(subscribe => {
        assert.equal(subscribe, false)
        return global.app.orm['Transaction'].destroy({where: {order_id: resOrder.id}})
      })
      .then(() => {
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('should auto fulfill order when financial_status is updated to paid and fulfillment is immediate', (done) => {
    const resOrder = Order.build({
      shop_id: 1,
      customer_id: 1,
      fulfillment_kind: 'immediate',
      total_price: 10
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      },{
        model: OrderItem,
        as: 'order_items'
      },{
        model: global.app.orm['Fulfillment'],
        as: 'fulfillments'
      },{
        model: global.app.orm['Event'],
        as: 'events'
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
    resOrder.set('order_items', [
      {
        product_id: 1,
        product_handle: 'makerbot-replicator',
        variant_id: 1,
        price: 10,
        sku: 'printer-w-123',
        type: '3D Printer',
        fulfillable_quantity: 1,
        fulfillment_service: 'manual',
        quantity: 1,
        max_quantity: -1,
        requires_subscription: true,
        requires_shipping: false
      }
    ])
    return resOrder.save()
      .then(order => {
        assert.equal(resOrder.financial_status, 'pending')
        assert.equal(resOrder.fulfillment_status, 'none')
        const retry = resOrder.transactions.filter(transaction => transaction.status == 'failure')[0]
        return global.app.services.TransactionService.retry(retry)
      })
      .then(transaction => {
        return resOrder.reload()
      })
      .then(() => {
        assert.equal(resOrder.financial_status, 'paid')
        assert.equal(resOrder.fulfillment_status, 'fulfilled')
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
