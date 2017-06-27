'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS

/**
 * @module TransactionService
 * @description Transaction Service
 */
module.exports = class TransactionService extends Service {

  /**
   *
   * @param transaction
   * @param options
   * @returns {transaction}
   */
  create(transaction, options) {
    options = options || {}
    const Transaction = this.app.orm.Transaction
    return Transaction.create(transaction, options)
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  authorize(transaction, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    return Transaction.resolve(transaction, options)
      .then(transaction => {
        return this.app.services.PaymentService.authorize(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  capture(transaction, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    return Transaction.resolve(transaction, options)
      .then(transaction => {
        if (!transaction) {
          throw new Errors.FoundError(Error('Transaction not found'))
        }
        return this.app.services.PaymentService.capture(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  sale(transaction, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    return Transaction.resolve(transaction, options)
      .then(transaction => {
        if (!transaction) {
          throw new Errors.FoundError(Error('Transaction not found'))
        }
        return this.app.services.PaymentService.sale(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  void(transaction, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    return Transaction.resolve(transaction, options)
      .then(transaction => {
        if (!transaction) {
          throw new Errors.FoundError(Error('Transaction not found'))
        }
        return this.app.services.PaymentService.void(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  refund(transaction, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    let resTransaction
    return Transaction.resolve(transaction, options)
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction not found'))
        }
        resTransaction = foundTransaction
        return this.app.services.PaymentService.refund(resTransaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param amount
   * @param options
   * @returns {Promise.<transaction>}
   */
  partiallyRefund(transaction, amount, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    let resTransaction
    return Transaction.resolve(transaction, options)
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        resTransaction = foundTransaction
        // transaction.amount = amount
        resTransaction.amount = Math.max(0, resTransaction.amount - amount)
        return resTransaction.save()
      })
      .then(() => {
        const newTransaction = _.omit(resTransaction.get({plain: true}), ['id'])
        newTransaction.amount = amount
        return this.create(newTransaction, options)
      })
      .then(newTransaction => {
        return this.app.services.PaymentService.refund(newTransaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<TResult>|*}
   */
  cancel(transaction, options) {
    const Transaction = this.app.orm['Transaction']
    let resTransaction
    return Transaction.resolve(transaction, options)
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        if ([TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.FAILURE].indexOf(foundTransaction.status) === -1) {
          throw new Error('Transaction can not be cancelled if it is not pending or failed')
        }
        resTransaction = foundTransaction
        return this.app.services.PaymentService.cancel(resTransaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  retry(transaction, options) {
    const Transaction = this.app.orm['Transaction']
    let resTransaction
    return Transaction.resolve(transaction, options)
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        if (foundTransaction.status !== TRANSACTION_STATUS.FAILURE) {
          throw new Error('Transaction can not retried if it has not yet failed')
        }
        resTransaction = foundTransaction
        return this.app.services.PaymentService.retry(resTransaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  afterCreate(transaction, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    return Order.findById(transaction.order_id, {transaction: options.transaction || null})
      .then(order => {
        return order.saveFinancialStatus({transaction: options.transaction || null})
      })
      .then(order => {
        return transaction
      })
  }
  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  afterUpdate(transaction, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    return Order.findById(transaction.order_id, {transaction: options.transaction || null})
      .then(order => {
        return order.saveFinancialStatus({transaction: options.transaction || null})
      })
      .then(order => {
        return transaction
      })
  }
}

