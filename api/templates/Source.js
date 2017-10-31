/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-email').Template

module.exports = class Source extends Template {
  /**
   *
   * @param source
   * @returns {string}
   */
  willExpire(source) {
    let type
    switch (source.payment_details.type) {
    case 'credit_card':
      type = 'Credit Card'
      break
    case 'debit_card':
      type = 'Debit Card'
      break
    default:
      type = 'Payment Method'
    }
    return `<h1>${ type } Will Expire</h1>
<p>Dear ${source.Customer ? source.Customer.getSalutation() : 'Customer'},</p>
<p>Your ${ source.payment_details.credit_card_company} ${ type } ending in ${ source.payment_details.credit_card_last4 } expires on ${source.payment_details.credit_card_exp_month}/${ source.payment_details.credit_card_exp_year}. Please consider logging in and updating it.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param source
   * @returns {string}
   */
  expired(source) {
    let type
    switch (source.payment_details.type) {
    case 'credit_card':
      type = 'Credit Card'
      break
    case 'debit_card':
      type = 'Debit Card'
      break
    default:
      type = 'Payment Method'
    }
    return `<h1>${ type } Expired</h1>
<p>Dear ${source.Customer ? source.Customer.getSalutation() : 'Customer'},</p>
<p>Your ${ source.payment_details.credit_card_company} ${ type } ending in ${ source.payment_details.credit_card_last4 } expired ${source.payment_details.credit_card_exp_month}/${ source.payment_details.credit_card_exp_year}. Please consider logging in and updating it.</p>
<p>Thank you!</p>`
  }
}
