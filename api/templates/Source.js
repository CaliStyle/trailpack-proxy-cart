/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-email').Template

module.exports = class Source extends Template {
  /**
   *
   * @param source
   * @returns {string}
   */
  expired(source) {
    return `<h1>Your ${ source.getType() } Expired</h1>
<p>Dear ${source.Customer ? source.Customer.getSalutation() : 'Customer'},</p>
<p>Your ${ source.getBrand() } ${ source.getType() } ending in ${ source.getLast4() } expired ${source.getExpiration()}. Please consider logging in and updating it.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param source
   * @returns {string}
   */
  willExpire(source) {
    return `<h1>Your ${ source.getType() } Will Expire</h1>
<p>Dear ${source.Customer ? source.Customer.getSalutation() : 'Customer'},</p>
<p>Your ${ source.getBrand() } ${ source.getType() } ending in ${ source.getLast4() } expires on ${source.getExpiration()}. Please consider logging in and updating it.</p>
<p>Thank you!</p>`
  }
}
