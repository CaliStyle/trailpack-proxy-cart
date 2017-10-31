/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-email').Email

module.exports = class Customer extends Email {
  /**
   *
   * @param customer
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  invite(customer, data, options) {
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, options)
      .then(_customer => {
        if (!_customer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = _customer

        const subject = data.subject || `${ resCustomer.name } Invitation`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return this.compose('invite', subject, resCustomer, sendEmail)
      })

  }

  /**
   *
   * @param customer
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  inviteAccepted(customer, data, options) {
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, options)
      .then(_customer => {
        if (!_customer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = _customer

        const subject = data.subject || `${ resCustomer.name } Invite Accepted`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return this.compose('inviteAccepted', subject, resCustomer, sendEmail)
      })
  }
  /**
   *
   * @param customer
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  accountBalanceUpdated(customer, data, options) {
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, options)
      .then(_customer => {
        if (!_customer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = _customer

        const subject = data.subject || `${ resCustomer.name } Account Balance Updated`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return this.compose('accountBalanceUpdated', subject, resCustomer, sendEmail)
      })
  }
  /**
   *
   * @param customer
   * @param data
   * @param options
   */
  accountBalanceDeducted(customer, data, options) {
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, options)
      .then(_customer => {
        if (!_customer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = _customer

        const subject = data.subject || `${ resCustomer.name } Account Balance Deducted`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return this.compose('accountBalanceDeducted', subject, resCustomer, sendEmail)
      })
  }

  /**
   *
   * @param customer
   * @param data
   * @param options
   */
  retarget(customer, data, options) {
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, options)
      .then(_customer => {
        if (!_customer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = _customer

        const subject = data.subject || `${ resCustomer.name } you have items in your cart!`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return this.compose('retarget', subject, resCustomer, sendEmail)
      })
  }
}
