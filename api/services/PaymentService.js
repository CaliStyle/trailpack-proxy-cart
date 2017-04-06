/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
// const _ = require('lodash')
/**
 * @module PaymentService
 * @description Payment Service
 */
module.exports = class PaymentService extends Service {
  /**
   * Authorizes and amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  authorize(transaction){
    const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    let resTransaction
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
          type: `transaction.authorize.${transaction.status}`,
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
   * @param source
   * @param amount
   * @returns {Promise}
   */
  capture(transaction){
    const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    let resTransaction
    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.capture(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: transaction.order_id,
          object: 'order',
          type: `transaction.capture.${transaction.status}`,
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
   * @param source
   * @param amount
   * @returns {Promise}
   */
  sale(transaction){
    const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    // console.log('cart checkout', transaction)
    let resTransaction
    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.sale(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: transaction.order_id,
          object: 'order',
          type: `transaction.sale.${transaction.status}`,
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
   * @param source
   * @param amount
   * @returns {Promise}
   */
  manual(transaction){
    const Transaction = this.app.orm.Transaction
    transaction = Transaction.build(transaction)
    return Promise.resolve(transaction)
  }

  void(transaction){
    const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    let resTransaction
    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.void(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: transaction.order_id,
          object: 'order',
          type: `transaction.void.${transaction.status}`,
          data: transaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }
  refund(transaction){
    const Transaction = this.app.orm.Transaction
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    let resTransaction
    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.refund(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
      .then(transaction => {
        resTransaction = transaction
        const event = {
          object_id: transaction.order_id,
          object: 'order',
          type: `transaction.refund.${transaction.status}`,
          data: transaction
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resTransaction
      })
  }
}

