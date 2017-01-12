'use strict'

const Service = require('trails/service')

/**
 * @module PaymentService
 * @description Payment Service
 */
module.exports = class PaymentService extends Service {
  /**
   * Authorizes and amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  // TODO
  authorize(source, amount){
    return Promise.resolve({status: 'authorized'})
  }

  /**
   * Captures and Authorized Amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  // TODO
  capture(source, amount){
    return Promise.resolve({status: 'authorized'})
  }

  /**
   * Authorizes and Captures an amount
   * @param source
   * @param amount
   * @returns {Promise.<{status: string}>}
   */
  // TODO
  sale(source, amount){
    return Promise.resolve({status: 'paid'})
  }

  /**
   *
   * @param source
   * @param amount
   * @returns {Promise}
   */
  // TODO
  manual(source, amount){
    return Promise.resolve({status: 'pending'})
  }
}

