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
  // TODO
  create(transaction, options) {
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
    return this.app.services.PaymentService.authorize(transaction, options)
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  capture(transaction, options) {
    return this.app.services.PaymentService.capture(transaction, options)
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  sale(transaction, options) {
    return this.app.services.PaymentService.sale(transaction, options)
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  void(transaction, options) {
    return this.app.services.PaymentService.void(transaction, options)
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
   */
  refund(transaction, options) {
    return this.app.services.PaymentService.refund(transaction, options)
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<transaction>}
   */
  afterCreate(transaction, options) {
    const Order = this.app.orm['Order']
    return Order.findById(transaction.order_id)
      .then(order => {
        return order.saveFinancialStatus()
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
    const Order = this.app.orm['Order']
    return Order.findById(transaction.order_id)
      .then(order => {
        return order.saveFinancialStatus()
      })
      .then(order => {
        return transaction
      })
  }
}

