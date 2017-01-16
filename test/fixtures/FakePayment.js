'use strict'
const _ = require('lodash')
module.exports = class FakePaymentProcessor {
  constructor(options) {
    this.options = options
  }
  authorize(transaction) {

    transaction.kind = 'authorize'
    transaction.authorization = 'abc123'

    if (transaction.payment_details.length == 0) {
      transaction.error_code = 'processing_error'
      transaction.status = 'failure'
    }
    else {
      transaction.status = 'success'
      transaction.payment_details = _.map(transaction.payment_details, card => {
        card.avs_result_code = '123'
        card.credit_card_iin = '123'
        card.credit_card_company = 'visa'
        card.credit_card_number = '**** **** **** 1234'
        card.cvv_result_code = 'Y'
        return card
      })
    }
    return Promise.resolve(transaction)
  }
  capture(transaction) {
    transaction.status = 'success'
    transaction.kind = 'capture'
    return Promise.resolve(transaction)
  }
  sale(transaction) {
    transaction.authorization = 'abc123'
    transaction.status = 'success'
    transaction.kind = 'sale'
    transaction.payment_details = _.map(transaction.payment_details, card => {
      card.avs_result_code = '123'
      card.credit_card_iin = '123'
      card.credit_card_company = 'visa'
      card.credit_card_number = '**** **** **** 1234'
      card.cvv_result_code = 'Y'
      return card
    })
    return Promise.resolve(transaction)
  }
  void(transaction) {
    transaction.kind = 'void'
    transaction.status = 'success'
    return Promise.resolve(transaction)
  }
  refund(transaction) {
    transaction.kind = 'refund'
    transaction.status = 'success'
    return Promise.resolve(transaction)
  }
}
