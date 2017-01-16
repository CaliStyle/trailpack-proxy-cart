/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
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
          return this.app.services.PaymentGenericService.authorize(transaction, paymentProcessor)
            .then(resTransaction => {
              return _.extend(transaction, resTransaction)
            })
        }
        else {
          // TODO handle this
          return transaction
        }
      })
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
    const TransactionService = this.app.services.TransactionService
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    // Defaults for this method
    transaction.kind = 'capture'
    return TransactionService.create(transaction)
      .then(transaction => {
        if (paymentProcessor && paymentProcessor.adapter) {
          return this.app.services.PaymentGenericService.capture(transaction, paymentProcessor)
        }
        else {
          // TODO handle this
          return transaction
        }
      })
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
    const TransactionService = this.app.services.TransactionService
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    // Defaults for this method
    transaction.kind = 'sale'
    return TransactionService.create(transaction)
      .then(transaction => {
        if (paymentProcessor && paymentProcessor.adapter) {
          return this.app.services.PaymentGenericService.sale(transaction, paymentProcessor)
        }
        else {
          // TODO handle this
          return transaction
        }
      })
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
  manual(source, amount){
    return Promise.resolve({status: 'pending'})
  }

  void(transaction){
    const TransactionService = this.app.services.TransactionService
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    // Defaults for this method
    transaction.kind = 'void'
    return TransactionService.create(transaction)
      .then(transaction => {
        if (paymentProcessor && paymentProcessor.adapter) {
          return this.app.services.PaymentGenericService.void(transaction, paymentProcessor)
        }
        else {
          // TODO handle this
          return transaction
        }
      })
      .then(transaction => {
        return transaction.save()
      })
  }
  refund(transaction){
    const TransactionService = this.app.services.TransactionService
    const paymentProcessor = this.app.config.proxyGenerics[transaction.gateway] || this.app.config.proxyGenerics.payment_processor
    // Defaults for this method
    transaction.kind = 'refund'
    return TransactionService.create(transaction)
      .then(transaction => {
        if (paymentProcessor && paymentProcessor.adapter) {
          return this.app.services.PaymentGenericService.refund(transaction, paymentProcessor)
        }
        else {
          // TODO handle this
          return transaction
        }
      })
      .then(transaction => {
        return transaction.save()
      })
  }
}

