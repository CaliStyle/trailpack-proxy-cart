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
    return `<h1>Payment Method ${ source.token } Will Expire</h1>
<p>Dear ${source.Customer ? source.Customer.getSalutation() : 'Customer'},</p>
<p>Your payment method will soon expire. Please consider logging in and updating it.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param source
   * @returns {string}
   */
  expired(source) {
    return `<h1>Payment Method ${ source.token } Will Expire</h1>
<p>Dear ${source.Customer ? source.Customer.getSalutation() : 'Customer'},</p>
<p>Your payment method expired. Please consider logging in and updating it.</p>
<p>Thank you!</p>`
  }
}
