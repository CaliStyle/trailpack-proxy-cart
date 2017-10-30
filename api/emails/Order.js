/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-email').Email

module.exports = class Order extends Email {
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  created(order, data, options) {
    options = options || {}
    data = data || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {
        return resOrder.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {

        const subject = data.subject || `Order ${ resOrder.name } Created`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`ORDER CREATED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return this.compose('created', subject, resOrder, sendEmail)
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  cancelled(order, data, options) {
    options = options || {}
    data = data || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {

        const subject = data.subject || `Order ${ resOrder.name } Cancelled`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER CANCELLED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return this.compose('cancelled', subject, resOrder, sendEmail)
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  failed(order, data, options) {
    options = options || {}
    data = data || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {

        const subject = data.subject || `Order ${ resOrder.name } Failed`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER FAILED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return this.compose('failed', subject, resOrder, sendEmail)
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  fulfilled(order, data, options) {
    options = options || {}
    data = data || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {

        const subject = data.subject || `Order ${ resOrder.name } Fulfilled`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER FULFILLED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return this.compose('fulfilled', subject, resOrder, sendEmail)
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  paid(order, data, options) {
    options = options || {}
    data = data || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {

        const subject = data.subject || `Order ${ resOrder.name } Paid`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER PAID SEND EMAIL ${ resOrder.name }`, sendEmail)

        return this.compose('paid', subject, resOrder, sendEmail)
      })
  }

  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  partiallyPaid(order, data, options) {
    options = options || {}
    data = data || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {
        const subject = data.subject || `Order ${ resOrder.name } Partially Paid Receipt`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER PARTIALLY PAID SEND EMAIL ${ resOrder.name }`, sendEmail)

        return this.compose('partiallyPaid', subject, resOrder, sendEmail)
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  refunded(order, data, options) {
    options = options || {}
    data = data || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {

        const subject = data.subject || `Order ${ resOrder.name } Refunded`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER REFUNDED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return this.compose('refunded', subject, resOrder, sendEmail)
      })
  }

  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  updated(order, data, options) {
    options = options || {}
    data = data || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, {transaction: options.transaction || null })
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        return resOrder.resolveOrderItems({transaction: options.transaction || null})
      })
      .then(() => {

        const subject = data.subject || `Order ${ resOrder.name } Updated`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER UPDATED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return this.compose('updated', subject, resOrder, sendEmail)
      })
  }
}
