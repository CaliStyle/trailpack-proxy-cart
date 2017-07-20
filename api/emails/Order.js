/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-generics').Email

module.exports = class Order extends Email {
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string}>}
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

        const text = data.text || `${ resOrder.name }`
        const html = data.html || `${ resOrder.name }`
        const subject = data.subject || `Order ${ resOrder.name } Fulfilled`

        return {
          type: 'order.updated',
          subject: subject,
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string}>}
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

        const text = data.text || `${ resOrder.name }`
        const html = data.html || `${ resOrder.name }`
        const subject = data.subject || `Order ${ resOrder.name } Fulfilled`

        return {
          type: 'order.fulfilled',
          subject: subject,
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string}>}
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

        const text = data.text || `${ resOrder.name }`
        const html = data.html || `${ resOrder.name }`
        const subject = data.subject || `Order ${ resOrder.name } Fulfilled`

        return {
          type: 'order.failed',
          subject: subject,
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string}>}
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

        const text = data.text || `${ resOrder.name }`
        const html = data.html || `${ resOrder.name }`
        const subject = data.subject || `Order ${ resOrder.name } Fulfilled`

        return {
          type: 'order.fulfilled',
          subject: subject,
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string}>}
   */
  receipt(order, data, options) {
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

        const text = data.text || `${ resOrder.name }`
        const html = data.html || `${ resOrder.name }`
        const subject = data.subject || `Order ${ resOrder.name } Fulfilled`

        return {
          type: 'order.receipt',
          subject: subject,
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string}>}
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

        const text = data.text || `${ resOrder.name }`
        const html = data.html || `${ resOrder.name }`
        const subject = data.subject || `Order ${ resOrder.name } Fulfilled`

        return {
          type: 'order.refunded',
          subject: subject,
          text: text,
          html: html
        }
      })
  }
}
