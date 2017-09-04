/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-email').Email

module.exports = class Subscription extends Email {
  /**
   *
   * @param subscription
   * @param data
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  cancelled(subscription, data, options) {
    options = options || {}
    data = data || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription

        return resSubscription.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {

        const text = data.text || `Subscription ${ resSubscription.token } Cancelled`
        const html = data.html || this.app.templates.Subscription.cancelled(resSubscription)
        const subject = data.subject || `Subscription ${ resSubscription.token } Cancelled`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SUBSCRIPTION CANCELLED SEND EMAIL ${ resSubscription.token }`, sendEmail)

        return {
          type: 'subscription.cancelled',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
      })

  }
  /**
   *
   * @param subscription
   * @param data
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  failed(subscription, data, options) {
    options = options || {}
    data = data || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription

        return resSubscription.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {

        const text = data.text || `Subscription ${ resSubscription.token } Failed`
        const html = data.html || this.app.templates.Subscription.willRenew(resSubscription)
        const subject = data.subject || `Subscription ${ resSubscription.token } Failed`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SUBSCRIPTION FAILED SEND EMAIL ${ resSubscription.token }`, sendEmail)

        return {
          type: 'subscription.failed',
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
   * @returns {Promise.<{text: string, html:string}>}
   */
  renewed(order, data, options) {
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

        const text = data.text || `Subscription ${ resOrder.subscription_token } Renewed`
        const html = data.html || this.app.templates.Subscription.renewed(resOrder)
        const subject = data.subject || `Subscription ${ resOrder.subscription_token } Renewed`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SUBSCRIPTION RENEWED SEND EMAIL ${ resOrder.subscription_token }`, sendEmail)

        return {
          type: 'subscription.renewed',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
      })

  }
  /**
   *
   * @param subscription
   * @param data
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  activated(subscription, data, options) {
    options = options || {}
    data = data || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription
        return resSubscription.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {

        const text = data.text || `Subscription ${ resSubscription.token } Activated`
        const html = data.html || this.app.templates.Subscription.activated(resSubscription)
        const subject = data.subject || `Subscription ${ resSubscription.token } Activated`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SUBSCRIPTION ACTIVATED SEND EMAIL ${ resSubscription.token }`, sendEmail)

        return {
          type: 'subscription.activated',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
      })

  }
  /**
   *
   * @param subscription
   * @param data
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  deactivated(subscription, data, options) {
    options = options || {}
    data = data || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription
        return resSubscription.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {

        const text = data.text || `Subscription ${ resSubscription.token } Deactivated`
        const html = data.html || this.app.templates.Subscription.deactivated(resSubscription)
        const subject = data.subject || `Subscription ${ resSubscription.token } Deactivated`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SUBSCRIPTION DEACTIVATED SEND EMAIL ${ resSubscription.token }`, sendEmail)

        return {
          type: 'subscription.deactivated',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
      })
  }

  /**
   *
   * @param subscription
   * @param data
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  updated(subscription, data, options) {
    options = options || {}
    data = data || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }

        resSubscription = foundSubscription

        return resSubscription.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {

        const text = data.text || `Subscription ${ resSubscription.token } Updated`
        const html = data.html || this.app.templates.Subscription.updated(resSubscription)
        const subject = data.subject || `Subscription ${ resSubscription.token } Updated`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SUBSCRIPTION UPDATED SEND EMAIL ${ resSubscription.token }`, sendEmail)

        return {
          type: 'subscription.updated',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
      })
  }

  /**
   *
   * @param subscription
   * @param data
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  willRenew(subscription, data, options) {
    options = options || {}
    data = data || {}
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }

        resSubscription = foundSubscription

        return resSubscription.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {

        const text = data.text || `Subscription ${ resSubscription.token } Will Renew`
        const html = data.html || this.app.templates.Subscription.willRenew(resSubscription)
        const subject = data.subject || `Subscription ${ resSubscription.token } Will Renew`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SUBSCRIPTION WILL RENEW SEND EMAIL ${ resSubscription.token }`, sendEmail)

        return {
          type: 'subscription.willRenew',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
      })

  }
}
