/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const TRANSACTION_KIND = require('../utils/enums').TRANSACTION_KIND
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
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction not found'))
        }
        if (foundTransaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error('Transaction must have successful to be refunded')
        }
        return this.app.services.PaymentService.void(foundTransaction, options)
      })
  }

  /**
   *
   * @param transaction
   * @param amount
   * @param options
   * @returns {Promise.<T>}
   */
  partiallyVoid(transaction, amount, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    let resTransaction
    return Transaction.resolve(transaction, options)
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        if (foundTransaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error('Transaction must have successful to be voided')
        }
        if (foundTransaction.kind !== TRANSACTION_KIND.AUTHORIZE) {
          throw new Error(`Transaction must be ${TRANSACTION_KIND.AUTHORIZE} to be partially voided`)
        }
        resTransaction = foundTransaction
        // transaction.amount = amount
        resTransaction.amount = Math.max(0, resTransaction.amount - amount)
        return resTransaction.save(options)
      })
  }

  /**
   *
   * @param transaction
   * @param options
   * @returns {Promise.<T>}
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
        if (foundTransaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error('Transaction must have been successful to be refunded')
        }
        if ([TRANSACTION_KIND.CAPTURE, TRANSACTION_KIND.SALE].indexOf(foundTransaction.kind) === -1) {
          throw new Error(`Only Transactions that are ${TRANSACTION_KIND.CAPTURE} or ${TRANSACTION_KIND.SALE} can be refunded`)
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
   * @returns {Promise.<T>}
   */
  // TODO, double check if partial or full refund
  partiallyRefund(transaction, amount, options) {
    options = options || {}
    const Transaction = this.app.orm['Transaction']
    let resTransaction
    return Transaction.resolve(transaction, options)
      .then(foundTransaction => {
        if (!foundTransaction) {
          throw new Errors.FoundError(Error('Transaction Not Found'))
        }
        if (foundTransaction.status !== TRANSACTION_STATUS.SUCCESS) {
          throw new Error('Transaction must have been successful to be refunded')
        }
        if ([TRANSACTION_KIND.CAPTURE, TRANSACTION_KIND.SALE].indexOf(foundTransaction.kind) === -1) {
          throw new Error(`Only Transactions that are ${TRANSACTION_KIND.CAPTURE} or ${TRANSACTION_KIND.SALE} can be refunded`)
        }
        resTransaction = foundTransaction
        // transaction.amount = amount
        resTransaction.amount = Math.max(0, resTransaction.amount - amount)
        return resTransaction.save(options)
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
   * @returns {Promise.<T>}
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
   * @returns {Promise.<T>}
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

  reconcileCreate(order, amount, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    let resOrder, totalNew = 0, availablePending = []
    return Order.resolve(order, {transaction: options.transaction || null})
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Errors.FoundError(Error('Order Not Found'))
        }
        resOrder = foundOrder
        if (!resOrder.transactions) {
          return resOrder.getTransactions()
        }
        else {
          return resOrder.transactions
        }
      })
      .then(transactions => {
        transactions = transactions || []
        resOrder.set('transactions', transactions)
        return
      })
      .then(() => {
        totalNew = amount
        availablePending = resOrder.transactions.filter(transaction =>
        transaction.status === TRANSACTION_STATUS.PENDING
        && [TRANSACTION_KIND.SALE, TRANSACTION_KIND.CAPTURE, TRANSACTION_KIND.AUTHORIZE].indexOf(transaction.kind) > -1)

        // If some pending transactions just add the new amount total to one of the transactions
        if (availablePending.length > 0) {
          availablePending[0].amount = availablePending[0].amount + totalNew
          return availablePending[0].save({hooks: false})
        }
        else {
          const transaction = {
            // Set the customer id (in case we can save this source)
            customer_id: resOrder.customer_id,
            // Set the order id
            order_id: resOrder.id,
            // Set the source if it is given
            // source_id: detail.source ? detail.source.id : null,
            // Set the order currency
            currency: resOrder.currency,
            // Set the amount for this transaction and handle if it is a split transaction
            amount: totalNew,
            // Copy the entire payment details to this transaction
            // payment_details: obj.payment_details[index],
            // Specify the gateway to use
            gateway: resOrder.payment_gateway_names[0],
            // Set the device (that input the credit card) or null
            // device_id: obj.device_id || null,
            // The kind of this new transaction
            kind: resOrder.payment_kind,
            // Set the Description
            description: `Order ${resOrder.name} original transaction ${resOrder.payment_kind}`
          }
          return this.app.services.PaymentService[resOrder.payment_kind](transaction, {hooks: false})
            .then(transaction => {
              // resOrder.addTransaction(transaction) has an updatedAt bug
              const transactions = resOrder.transactions.concat(transaction)
              resOrder.set('transactions', transactions)
              return // resOrder.addTransaction(transaction.id)
            })
        }
      })
      .then(() => {
        return resOrder// .reload()
      })
  }

  reconcileUpdate(order, amount, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    let resOrder,
      totalNew = 0,
      availablePending = [],
      availableAuthorized = [],
      availableRefund = [],
      toUpdate = []

    return Order.resolve(order, {transaction: options.transaction || null})
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Errors.FoundError(Error('Order Not Found'))
        }
        resOrder = foundOrder
        if (!resOrder.transactions) {
          return resOrder.getTransactions()
        }
        else {
          return resOrder.transactions
        }
      })
      .then(transactions => {
        transactions = transactions || []
        resOrder.set('transactions', transactions)

        totalNew = amount

        availablePending = resOrder.transactions.filter(transaction =>
        transaction.status === TRANSACTION_STATUS.PENDING
        && [TRANSACTION_KIND.SALE, TRANSACTION_KIND.CAPTURE, TRANSACTION_KIND.AUTHORIZE].indexOf(transaction.kind) > -1)
          .sort((a, b) => {
            return b.amount - a.amount
          })

        availableAuthorized = resOrder.transactions.filter(transaction =>
        transaction.status === TRANSACTION_STATUS.SUCCESS
        && [TRANSACTION_KIND.AUTHORIZE].indexOf(transaction.kind) > -1)
          .sort((a, b) => {
            return b.amount - a.amount
          })

        availableRefund = resOrder.transactions.filter(transaction =>
        transaction.status === TRANSACTION_STATUS.SUCCESS
        && [TRANSACTION_KIND.CAPTURE, TRANSACTION_KIND.SALE].indexOf(transaction.kind) > -1)
          .sort((a, b) => {
            return b.amount - a.amount
          })

        availablePending.forEach(transaction => {
          if (totalNew > 0) {
            const oldAmount = transaction.amount
            const newAmount = Math.max(0, transaction.amount - totalNew)
            totalNew = totalNew - oldAmount
            transaction.amount = newAmount
            toUpdate.push(transaction.save({hooks: false}))
          }
        })
        availableAuthorized.forEach(transaction => {
          if (totalNew > 0) {
            const oldAmount = transaction.amount
            const newAmount = Math.max(0, transaction.amount - totalNew)
            totalNew = totalNew - oldAmount
            toUpdate.push(this.partiallyVoid(transaction, oldAmount - newAmount, { hooks: false }))
          }
        })
        availableRefund.forEach(transaction => {
          if (totalNew > 0) {
            const oldAmount = transaction.amount
            const newAmount = Math.max(0, transaction.amount - totalNew)
            totalNew = totalNew - oldAmount
            toUpdate.push(this.partiallyRefund(transaction, oldAmount - newAmount, { hooks: false }))
          }
        })
        return Promise.all(toUpdate.map(update => { return update }))
      })
      .then(() => {
        return resOrder
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
    return Order.findById(transaction.order_id, {
      include: [
        {
          model: this.app.orm['Transaction'],
          as: 'transactions'
        },
        {
          model: this.app.orm['OrderItem'],
          as: 'order_items'
        },
        {
          model: this.app.orm['Fulfillment'],
          as: 'fulfillments'
        }
      ],
      // attributes: [
      //   'id',
      //   'financial_status',
      //   'fulfillment_status',
      //   'total_due',
      //   'total_price'
      // ],
      transaction: options.transaction || null
    })
      .then(order => {
        if (order) {
          return order.saveFinancialStatus({transaction: options.transaction || null})
            .catch(err => {
              this.app.log.error(err)
              return transaction
            })
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
    return Order.findById(transaction.order_id, {
      include: [
        {
          model: this.app.orm['Transaction'],
          as: 'transactions'
        },
        {
          model: this.app.orm['OrderItem'],
          as: 'order_items'
        },
        {
          model: this.app.orm['Fulfillment'],
          as: 'fulfillments'
        }
      ],
      // attributes: [
      //   'id',
      //   'financial_status',
      //   'fulfillment_status',
      //   'total_due',
      //   'total_price'
      // ],
      transaction: options.transaction || null
    })
      .then(order => {
        if (order) {
          return order.saveFinancialStatus({transaction: options.transaction || null})
            .catch(err => {
              this.app.log.error(err)
              return transaction
            })
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

