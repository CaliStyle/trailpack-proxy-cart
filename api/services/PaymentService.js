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
    const Transaction = this.app.services.ProxyEngineService.getModel('Transaction')
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.authorize(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })

  }

  /**
   * Captures and Authorized Amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  capture(transaction){
    const Transaction = this.app.services.ProxyEngineService.getModel('Transaction')
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.capture(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
  }

  /**
   * Authorizes and Captures an amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  sale(transaction){
    const Transaction = this.app.services.ProxyEngineService.getModel('Transaction')
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }

    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.sale(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
  }

  /**
   * Returns a pending promise (No Transaction Created)
   * @param source
   * @param amount
   * @returns {Promise}
   */
  manual(transaction){
    const Transaction = this.app.services.ProxyEngineService.getModel('Transaction')
    transaction = Transaction.build(transaction)
    return Promise.resolve(transaction)
  }

  void(transaction){
    const Transaction = this.app.services.ProxyEngineService.getModel('Transaction')
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }
    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.void(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })
  }
  refund(transaction){
    const Transaction = this.app.services.ProxyEngineService.getModel('Transaction')
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (!paymentProcessor || !paymentProcessor.adapter) {
      const err = new Error('Payment Processor is unspecified')
      return Promise.reject(err)
    }

    transaction = Transaction.build(transaction)
    return this.app.services.PaymentGenericService.refund(transaction, paymentProcessor)
      .then(transaction => {
        return transaction.save()
      })

  }
}

