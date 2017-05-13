'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
/**
 * @module TransactionService
 * @description Transaction Service
 */
module.exports = class TransactionService extends Service {
  resolve(transaction, options){
    const Transaction =  this.app.orm.Transaction
    if (transaction instanceof Transaction.Instance){
      return Promise.resolve(transaction)
    }
    else if (transaction && _.isObject(transaction) && transaction.id) {
      return Transaction.findById(transaction.id, options)
        .then(resTransaction => {
          if (!resTransaction) {
            throw new Errors.FoundError(Error(`Transaction ${transaction.id} not found`))
          }
          return resTransaction
        })
    }
    else if (transaction && (_.isString(transaction) || _.isNumber(transaction))) {
      return Transaction.findById(transaction, options)
        .then(resTransaction => {
          if (!resTransaction) {
            throw new Errors.FoundError(Error(`Transaction ${transaction} not found`))
          }
          return resTransaction
        })
    }
    else {
      const err = new Error('Unable to resolve Transaction')
      Promise.reject(err)
    }
  }
  /**
   *
   * @param transaction
   * @param options
   * @returns {transaction}
   */
  create(transaction, options) {
    if (!options) {
      options = {}
    }
    const Transaction = this.app.orm.Transaction
    return Transaction.create(transaction, options)
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  authorize(transaction, options) {
    if (!options) {
      options = {}
    }
    return this.resolve(transaction, options)
      .then(transaction => {
        return this.app.services.PaymentService.authorize(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  capture(transaction, options) {
    if (!options) {
      options = {}
    }
    return this.resolve(transaction, options)
      .then(transaction => {
        return this.app.services.PaymentService.capture(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  sale(transaction, options) {
    if (!options) {
      options = {}
    }
    return this.resolve(transaction, options)
      .then(transaction => {
        return this.app.services.PaymentService.sale(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  void(transaction, options) {
    if (!options) {
      options = {}
    }
    return this.resolve(transaction, options)
      .then(transaction => {
        return this.app.services.PaymentService.void(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  refund(transaction, options) {
    if (!options) {
      options = {}
    }
    return this.resolve(transaction, options)
      .then(transaction => {
        return this.app.services.PaymentService.refund(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param amount
   * @param options
   * @returns {Promise.<T>}
   */
  partiallyRefund(transaction, amount, options) {
    if (!options) {
      options = {}
    }
    return this.resolve(transaction, options)
      .then(transaction => {
        // transaction.amount = amount
        transaction.amount = Math.max(0, transaction.amount - amount)
        return transaction.save(options)
      })
      .then(transaction => {
        const newTransaction = _.omit(transaction.get({plain: true}), ['id'])
        newTransaction.amount = amount
        return this.create(newTransaction, options)
      })
      .then(transaction => {
        return this.app.services.PaymentService.refund(transaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  afterCreate(transaction, options) {
    if (!options) {
      options = {}
    }
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
    if (!options) {
      options = {}
    }
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

