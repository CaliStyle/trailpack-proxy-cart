'use strict'
/* global describe, it */
const assert = require('assert')

describe('Order Model', () => {
  let Order, OrderItem, Transaction, OrderService
  it('should exist', () => {
    assert(global.app.api.models['Order'])
    Order = global.app.orm['Order']
    OrderItem = global.app.orm['OrderItem']
    Transaction = global.app.orm['Transaction']
    OrderService = global.app.services['OrderService']
  })
  it('should resolve an order instance', (done) => {
    Order.resolve(Order.build({}))
      .then(order => {
        assert.ok(order instanceof Order)
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
      total_price: 10,
      total_items: 1
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
      total_price: 10,
      total_items: 1
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
      total_price: 10,
      total_items: 1
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
      total_price: 10,
      total_items: 1
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
      total_price: 10,
      total_items: 1
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
      total_price: 10,
      total_items: 1
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
      total_price: 10,
      total_items: 1
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      },{
        model: OrderItem,
        as: 'order_items',
        include: [ global.app.orm['Fulfillment'] ]
      },{
        model: global.app.orm['Fulfillment'],
        as: 'fulfillments',
        include: [
          {
            model: OrderItem,
            as: 'order_items'
          }
        ]
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
    resOrder.set('fulfillments', [
      {
        service: 'manual'
      }
    ])
    return resOrder.save()
      .then(order => {
        assert.equal(resOrder.financial_status, 'pending')
        assert.equal(resOrder.fulfillment_status, 'pending')
        // Add Order Item
        return resOrder.createOrder_item(
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
            requires_shipping: false,
            fulfillment_id: resOrder.fulfillments[0].id
          }
        )
          .then(() => {
            return resOrder.reload()
          })
      })
      .then(() => {
        const retry = resOrder.transactions.filter(transaction => transaction.status === 'failure')[0]
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

  it('should allow to add items to pending authorize/sale transaction', (done) => {
    const resOrder = Order.build({
      shop_id: 1,
      customer_id: 1,
      fulfillment_kind: 'manual',
      transaction_kind: 'authorize',
      payment_kind: 'manual',
      fulfillments: [
        {
          service: 'manual'
        }
      ]
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      },{
        model: OrderItem,
        as: 'order_items'
      },{
        model: global.app.orm['Fulfillment'],
        as: 'fulfillments',
        include: [
          {
            model: OrderItem,
            as: 'order_items'
          }
        ]
      },{
        model: global.app.orm['Event'],
        as: 'events'
      }]
    })
    resOrder.set('transactions', [
      {
        kind: 'authorize',
        status: 'pending',
        amount: 0
      },
    ])

    return resOrder.save()
      .then(order => {
        assert.equal(resOrder.financial_status, 'pending')
        assert.equal(resOrder.fulfillment_status, 'pending')
        return OrderService.addItem(resOrder, {product_id: 2, quantity: 1})
          .then(() => {
            return resOrder.reload()
          })
      })
      .then(order => {
        assert.equal(resOrder.financial_status, 'pending')
        assert.equal(resOrder.fulfillment_status, 'pending')
        assert.equal(resOrder.total_pending_fulfillments, 1)
        assert.equal(resOrder.total_pending, 100000)
        assert.equal(resOrder.total_price, 100000)
        assert.equal(resOrder.total_due, 100000)
        assert.equal(resOrder.transactions.length, 1)
        assert.equal(resOrder.transactions[0].status, 'pending')
        assert.equal(resOrder.transactions[0].kind, 'authorize')
        assert.equal(resOrder.transactions[0].amount, 100000)

        return OrderService.addItem(resOrder, {product_id: 2, quantity: 1})
          .then(() => {
            return resOrder.reload()
          })
      })
      .then((order) => {
        assert.equal(resOrder.financial_status, 'pending')
        assert.equal(resOrder.fulfillment_status, 'pending')
        assert.equal(resOrder.total_pending_fulfillments, 1)
        assert.equal(resOrder.total_pending, 200000)
        assert.equal(resOrder.total_price, 200000)
        assert.equal(resOrder.total_due, 200000)
        assert.equal(resOrder.transactions.length, 1)
        assert.equal(resOrder.transactions[0].status, 'pending')
        assert.equal(resOrder.transactions[0].kind, 'authorize')
        assert.equal(resOrder.transactions[0].amount, 200000)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should resolve transactions', (done) => {
    const resOrder = Order.build({
      shop_id: 1,
      customer_id: 1,
      fulfillment_kind: 'manual',
      transaction_kind: 'authorize',
      payment_kind: 'manual'
    }, {
      include: [{
        model: Transaction,
        as: 'transactions'
      }]
    })
    resOrder.set('transactions', [
      {
        kind: 'authorize',
        status: 'pending',
        amount: 0
      },
    ])
    resOrder.save()
      .then(() => {
        return resOrder.resolveTransactions()
      })
      .then(() => {
        assert.equal(resOrder.transactions.length, 1)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
