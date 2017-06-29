/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
// const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const TRANSACTION_KIND = require('../utils/enums').TRANSACTION_KIND
/**
 * @module PaymentService
 * @description Payment Service
 */
module.exports = class PaymentService extends Service {
  /**
   * Authorizes and amount
   * @param transaction
   * @param options
   * @returns {Promise}
   */
  authorize(transaction, options){
    options = options || {}
    const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    let resTransaction
    transaction.description = transaction.description || 'Transaction Authorize'
    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.authorize(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: transaction.order_id,
          object: 'order',
          objects: [{
            order: transaction.order_id
          },{
            transaction: transaction.id
          }],
          type: `order.transaction.authorize.${transaction.status}`,
          message: `Order ID ${transaction.order_id} transaction authorize of ${transaction.amount} ${transaction.currency} ${transaction.status}`,
          data: transaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })

  }

  /**
   * Captures and Authorized Amount
   * @param transaction
   * @param options
   * @returns {Promise}
   */
  capture(transaction, options){
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    // const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    let resTransaction
    // Resolve the authorized transaction
    transaction.description = transaction.description || 'Transaction Capture'
    return Transaction.resolve(transaction, {transaction: options.transaction || null })
      .then(transaction => {
        if (transaction.kind !== TRANSACTION_KIND.AUTHORIZE) {
          throw new Error(`Transaction kind must be '${TRANSACTION_KIND.AUTHORIZE}' to be captured`)
        }
        if (transaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error(`Transaction status must be '${TRANSACTION_STATUS.SUCCESS}' to be captured`)
        }
        return this.app.services.PaymentGenericService.capture(transaction, paymentProcessor)
      })
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: transaction.order_id,
          object: 'order',
          objects: [{
            order: transaction.order_id
          },{
            transaction: transaction.id
          }],
          type: `order.transaction.capture.${transaction.status}`,
          message: `Order ID ${transaction.order_id} transaction capture of ${transaction.amount} ${transaction.currency} ${transaction.status}`,
          data: transaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }

  /**
   * Authorizes and Captures an amount
   * @param transaction
   * @param options
   * @returns {Promise}
   */
  sale(transaction, options){
    options = options || {}

    const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    // console.log('cart checkout', transaction)
    let resTransaction
    transaction.description = transaction.description || 'Transaction Sale'
    transaction = Transaction.build(transaction, options)
    return this.app.services.PaymentGenericService.sale(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: resTransaction.order_id,
          object: 'order',
          objects: [{
            order: resTransaction.order_id
          },{
            transaction: resTransaction.id
          }],
          type: `order.transaction.sale.${resTransaction.status}`,
          message: `Order ID ${resTransaction.order_id} transaction sale of ${resTransaction.amount} ${resTransaction.currency} ${resTransaction.status}`,
          data: resTransaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }

  /**
   * Returns a pending promise (No Transaction Created)
   * @param transaction
   * @param options
   * @returns {Promise}
   */
  manual(transaction, options){
    options = options || {}
    const Transaction = this.app.orm.Transaction
    transaction = Transaction.build(transaction, options)
    return Promise.resolve(transaction)
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {*}
   */
  void(transaction, options){
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    // const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    transaction.description = transaction.description || 'Transaction Void'
    let resTransaction
    return Transaction.resolve(transaction, {transaction: options.transaction || null })
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        resTransaction = foundTransaction
        if (resTransaction.kind !== TRANSACTION_KIND.AUTHORIZE) {
          throw new Error(`Transaction kind must be '${TRANSACTION_KIND.AUTHORIZE}' to be voided`)
        }
        if (resTransaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error(`Transaction status must be '${TRANSACTION_STATUS.SUCCESS}' to be voided`)
        }
        return this.app.services.PaymentGenericService.void(resTransaction, paymentProcessor)
      })
      .then(() => {
        return resTransaction.save()
      })
      .then(() => {
        const event = {
          object_id: resTransaction.order_id,
          object: 'order',
          objects: [{
            order: resTransaction.order_id
          },{
            transaction: resTransaction.id
          }],
          type: `order.transaction.void.${resTransaction.status}`,
          message: `Order ID ${resTransaction.order_id} transaction voided of ${resTransaction.amount} ${resTransaction.currency} ${resTransaction.status}`,
          data: resTransaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {*}
   */
  refund(transaction, options){
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    // const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      // TODO throw proper error
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    let resTransaction
    transaction.description = transaction.description || 'Transaction Refund'
    return Transaction.resolve(transaction, {transaction: options.transaction || null })
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        resTransaction = foundTransaction

        if ([TRANSACTION_KIND.CAPTURE, TRANSACTION_KIND.SALE].indexOf(resTransaction.kind) == -1) {
          throw new Error(`Transaction kind must be '${TRANSACTION_KIND.CAPTURE}' or '${TRANSACTION_KIND.SALE}' to be refunded`)
        }
        if (resTransaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error(`Transaction status must be '${TRANSACTION_STATUS.SUCCESS}' to be refunded`)
        }
        return this.app.services.PaymentGenericService.refund(resTransaction, paymentProcessor)
      })
      .then(() => {
        return resTransaction.save()
      })
      .then(() => {
        const event = {
          object_id: resTransaction.order_id,
          object: 'order',
          objects: [{
            order: resTransaction.order_id
          },{
            transaction: resTransaction.id
          }],
          type: `order.transaction.refund.${resTransaction.status}`,
          message: `Order ID ${resTransaction.order_id} transaction refund of ${resTransaction.amount} ${resTransaction.currency} ${resTransaction.status}`,
          data: resTransaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<TResult>|*}
   */
  retry(transaction, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    let resTransaction
    return Transaction.resolve(transaction, {transaction: options.transaction || null })
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        if ([TRANSACTION_STATUS.FAILURE].indexOf(foundTransaction.status) === -1) {
          throw new Error('Transaction can not be retried if it has not failed')
        }
        const paymentProcessor = this.app.config.proxyGenerics[foundTransaction.gateway] || this.app.config.proxyGenerics.payment_processor
        if (!paymentProcessor || !paymentProcessor.adapter) {
          throw new Error('Payment Processor is unspecified')
        }
        resTransaction = foundTransaction

        return this.app.services.PaymentGenericService[resTransaction.kind](resTransaction, paymentProcessor)
      })
      .then(() => {
        return resTransaction.retry().save()
      })
      .then(() => {
        const event = {
          object_id: resTransaction.order_id,
          object: 'order',
          objects: [{
            order: resTransaction.order_id
          },{
            transaction: resTransaction.id
          }],
          type: `order.transaction.${resTransaction.kind}.${resTransaction.status}`,
          message: `Order ID ${resTransaction.order_id} transaction ${resTransaction.kind} of ${resTransaction.amount} ${resTransaction.currency} ${resTransaction.status}`,
          data: resTransaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<TResult>}
   */
  cancel(transaction, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    let resTransaction
    return Transaction.resolve(transaction, {transaction: options.transaction || null })
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        if ([TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.FAILURE].indexOf(foundTransaction.status) === -1) {
          throw new Error('Transaction can not be cancelled if it is not pending or failed')
        }
        resTransaction = foundTransaction
        return resTransaction.cancel().save()
      })
      .then(() => {
        const event = {
          object_id: resTransaction.order_id,
          object: 'order',
          objects: [{
            order: resTransaction.order_id
          },{
            transaction: resTransaction.id
          }],
          type: 'order.transaction.cancelled',
          message: `Order ID ${resTransaction.order_id} transaction of ${resTransaction.amount} ${resTransaction.currency} ${resTransaction.status}`,
          data: resTransaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }
}

