'use strict'

const Service = require('trails/service')
// const _ = require('lodash')
/**
 * @module PaymentService
 * @description Payment Service
 */
// TODO handle multiple payment methods
module.exports = class PaymentService extends Service {
  /**
   * Authorizes and amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  authorize(transaction){
    const TransactionService = this.app.services.TransactionService
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    // Defaults for this method
    transaction.kind = 'authorize'
    return TransactionService.create(transaction)
      .then(transaction => {
        if (paymentProcessor && paymentProcessor.adapter) {
          return this.app.service.PaymentGenericService.authorize(transaction, paymentProcessor)
        }
        else {
          return transaction
        }
      })
  }

  /**
   * Captures and Authorized Amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  capture(transaction){
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      return this.app.service.PaymentGenericService.capture(transaction, paymentProcessor)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }

  /**
   * Authorizes and Captures an amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  sale(transaction){
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      return this.app.service.PaymentGenericService.sale(transaction, paymentProcessor)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }

  /**
   * Returns a pending promise
   * @param source
   * @param amount
   * @returns {Promise}
   */
  manual(source, amount){
    return Promise.resolve({status: 'pending'})
  }

  void(transaction){
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      return this.app.service.PaymentGenericService.void(transaction, paymentProcessor)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }
  refund(transaction){
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      return this.app.service.PaymentGenericService.refund(transaction, paymentProcessor)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }
}

