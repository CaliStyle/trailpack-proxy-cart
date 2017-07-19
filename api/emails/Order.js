/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-generics').Email

module.exports = class Order extends Email {
  updated(order, options) {
    options = options || {}
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

        const text = `${ resOrder.name }`
        const html = `${ resOrder.name }`

        return {
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  cancelled(order, options) {
    options = options || {}
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

        const text = `${ resOrder.name }`
        const html = `${ resOrder.name }`

        return {
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  failed(order, options) {
    options = options || {}
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

        const text = `${ resOrder.name }`
        const html = `${ resOrder.name }`

        return {
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  fulfilled(order, options) {
    options = options || {}
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

        const text = `${ resOrder.name }`
        const html = `${ resOrder.name }`

        return {
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  receipt(order, options) {
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, options)
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        const text = `${ resOrder.name }`
        const html = `${ resOrder.name }`

        return {
          text: text,
          html: html
        }
      })
  }
  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  refunded(order, options) {
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, options)
      .then(foundOrder => {
        if (!foundOrder) {
          throw new Error('Order did not resolve')
        }
        resOrder = foundOrder

        const text = `${ resOrder.name }`
        const html = `${ resOrder.name }`

        return {
          text: text,
          html: html
        }
      })
  }
}
