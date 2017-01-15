'use strict'

const Service = require('trails-service')

/**
 * @module TransactionService
 * @description Transaction Service
 */
module.exports = class TransactionService extends Service {
  create(transaction, options) {
    const Transaction = this.app.services.ProxyEngineService.getModel('Transaction')
    return Transaction.create(transaction, options)
  }
}

