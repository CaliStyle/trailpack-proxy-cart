/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
// const _ = require('lodash')
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
          object_id: transaction.order_id,
          object: 'order',
          type: `order.transaction.sale.${transaction.status}`,
          message: `Order ID ${transaction.order_id} transaction sale of ${transaction.amount} ${transaction.currency} ${transaction.status}`,
          data: transaction
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
    let resTransaction
    transaction.description = transaction.description || 'Transaction Void'
    return Transaction.resolve(transaction, {transaction: options.transaction || null })
      .then(transaction => {
        if (transaction.kind !== TRANSACTION_KIND.AUTHORIZE) {
          throw new Error(`Transaction kind must be '${TRANSACTION_KIND.AUTHORIZE}' to be voided`)
        }
        if (transaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error(`Transaction status must be '${TRANSACTION_STATUS.SUCCESS}' to be voided`)
        }
        return this.app.services.PaymentGenericService.void(transaction, paymentProcessor)
      })
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: transaction.order_id,
          object: 'order',
          type: `order.transaction.void.${transaction.status}`,
          message: `Order ID ${transaction.order_id} transaction voided of ${transaction.amount} ${transaction.currency} ${transaction.status}`,
          data: transaction
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
      .then(transaction => {
        if ([TRANSACTION_KIND.CAPTURE, TRANSACTION_KIND.SALE].indexOf(transaction.kind) == -1) {
          throw new Error(`Transaction kind must be '${TRANSACTION_KIND.CAPTURE}' or '${TRANSACTION_KIND.SALE}' to be refunded`)
        }
        if (transaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error(`Transaction status must be '${TRANSACTION_STATUS.SUCCESS}' to be refunded`)
        }
        return this.app.services.PaymentGenericService.refund(transaction, paymentProcessor)
      })
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: transaction.order_id,
          object: 'order',
          type: `order.transaction.refund.${transaction.status}`,
          message: `Order ID ${transaction.order_id} transaction refund of ${transaction.amount} ${transaction.currency} ${transaction.status}`,
          data: transaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }
}

