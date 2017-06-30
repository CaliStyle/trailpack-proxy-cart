/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const moment = require('moment')

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
   * @returns {Promise.<TResult>}
   */
  retryThisHour() {
    const Transaction = this.app.orm['Transaction']
    const start = moment().startOf('hour')
    const errors = []
    // let errorsTotal = 0
    let transactionsTotal = 0

    this.app.log.debug('TransactionService.retryThisHour', start.format('YYYY-MM-DD HH:mm:ss'))

    return Transaction.batch({
      where: {
        retry_at: {
          $or: {
            $lte: start.format('YYYY-MM-DD HH:mm:ss'),
            $eq: null
          }
        },
        total_retry_attempts: {
          $gte: 0,
          $lte: this.app.config.proxyCart.transactions.retry_attempts || 1
        },
        status: TRANSACTION_STATUS.FAILURE
      },
      regressive: true
    }, (transactions) => {
      const Sequelize = Transaction.sequelize
      return Sequelize.Promise.mapSeries(transactions, transaction => {
        return this.retry(transaction)
      })
        .then(results => {
          // Calculate Totals
          transactionsTotal = transactionsTotal + results.length
          return
        })
        .catch(err => {
          // errorsTotal++
          this.app.log.error(err)
          errors.push(err)
          return
        })
    })
      .then(transactions => {
        const results = {
          transactions: transactionsTotal,
          errors: errors
        }
        this.app.log.info(results)
        this.app.services.ProxyEngineService.publish('transactions.retry.complete', results)
        return results
      })
      .catch(err => {
        this.app.log.error(err)
        return
      })
  }

  /**
   *
   * @returns {Promise.<TResult>}
   */
  cancelThisHour() {
    const Transaction = this.app.orm['Transaction']
    const errors = []
    // let errorsTotal = 0
    let transactionsTotal = 0

    this.app.log.debug('TransactionService.cancelThisHour')

    return Transaction.batch({
      where: {
        total_retry_attempts: {
          $gte: this.app.config.proxyCart.transactions.retry_attempts || 1
        },
        status: TRANSACTION_STATUS.FAILURE
      },
      regressive: true
    }, (transactions) => {

      const Sequelize = Transaction.sequelize
      return Sequelize.Promise.mapSeries(transactions, transaction => {
        return this.cancel(transaction)
      })
        .then(results => {
          // Calculate Totals
          transactionsTotal = transactionsTotal + results.length
          return
        })
        .catch(err => {
          // errorsTotal++
          this.app.log.error(err)
          errors.push(err)
          return
        })
    })
      .then(transactions => {
        const results = {
          transactions: transactionsTotal,
          errors: errors
        }
        this.app.log.info(results)
        this.app.services.ProxyEngineService.publish('transactions.cancel.complete', results)
        return results
      })
      .catch(err => {
        this.app.log.error(err)
        return
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
        if (order) {
          return order.saveFinancialStatus({transaction: options.transaction || null})
        }
        else {
          return
        }
      })
      .then(() => {
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
        if (order) {
          return order.saveFinancialStatus({transaction: options.transaction || null})
        }
        else {
          return
        }
      })
      .then(() => {
        return transaction
      })
  }
}

