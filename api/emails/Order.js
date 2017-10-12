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

        const text = data.text || `Order ${ resOrder.name } Created`
        const html = data.html || this.app.templates.Order.created(resOrder)
        const subject = data.subject || `Order ${ resOrder.name } Created`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`ORDER CREATED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return {
          type: 'order.created',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
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

        const text = data.text || `Order ${ resOrder.name } Updated`
        const html = data.html || this.app.templates.Order.updated(resOrder)
        const subject = data.subject || `Order ${ resOrder.name } Updated`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER UPDATED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return {
          type: 'order.updated',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
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

        const text = data.text || `Order ${ resOrder.name } Cancelled`
        const html = data.html || this.app.templates.Order.cancelled(resOrder)
        const subject = data.subject || `Order ${ resOrder.name } Cancelled`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER CANCELLED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return {
          type: 'order.fulfilled',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
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

        const text = data.text || `Order ${ resOrder.name } Failed`
        const html = data.html || this.app.templates.Order.failed(resOrder)
        const subject = data.subject || `Order ${ resOrder.name } Failed`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER FAILED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return {
          type: 'order.failed',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
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

        const text = data.text || `Order ${ resOrder.name } Fulfilled`
        const html = data.html || this.app.templates.Order.fulfilled(resOrder)
        const subject = data.subject || `Order ${ resOrder.name } Fulfilled`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER FULFILLED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return {
          type: 'order.fulfilled',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
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
        const text = data.text || `Order ${ resOrder.name } Receipt`
        const html = data.html || this.app.templates.Order.paid(resOrder)
        const subject = data.subject || `Order ${ resOrder.name } Receipt`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER PAID SEND EMAIL ${ resOrder.name }`, sendEmail)

        return {
          type: 'order.receipt',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
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

        const text = data.text || `Order ${ resOrder.name } Refunded`
        const html = data.html || this.app.templates.Order.refunded(resOrder)
        const subject = data.subject || `Order ${ resOrder.name } Refunded`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        this.app.log.debug(`ORDER REFUNDED SEND EMAIL ${ resOrder.name }`, sendEmail)

        return {
          type: 'order.refunded',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
      })
  }
}
