'use strict'

const Service = require('trails/service')
const _ = require('lodash')
/**
 * @module PaymentService
 * @description Payment Service
 */
// TODO handle multiple payment methods
module.exports = class PaymentService extends Service {
  /**
   * Authorizes and amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  authorize(source, amount){
    const paymentProcessor = this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      source = _.merge(source, {amount: amount})
      return this.app.service.PaymentGenericService.authorize(source)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }

  /**
   * Captures and Authorized Amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  capture(source, amount){
    const paymentProcessor = this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      source = _.merge(source, { amount: amount })
      return this.app.service.PaymentGenericService.capture(source)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }

  /**
   * Authorizes and Captures an amount
   * @param source
   * @param amount
   * @returns {Promise}
   */
  sale(source, amount){
    const paymentProcessor = this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      source = _.merge(source, { amount: amount })
      return this.app.service.PaymentGenericService.sale(source)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }

  /**
   * Returns a pending promise
   * @param source
   * @param amount
   * @returns {Promise}
   */
  manual(source, amount){
    return Promise.resolve({status: 'pending'})
  }

  void(source, amount){
    const paymentProcessor = this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      source = _.merge(source, { amount: amount })
      return this.app.service.PaymentGenericService.void(source)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }
  refund(source, amount){
    const paymentProcessor = this.app.config.proxyGenerics.payment_processor
    if (paymentProcessor && paymentProcessor.adapter) {
      source = _.merge(source, { amount: amount })
      return this.app.service.PaymentGenericService.refund(source)
    }
    else {
      return Promise.resolve({status: 'pending'})
    }
  }
}

