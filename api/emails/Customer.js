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
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = foundCustomer

        const text = `${ resCustomer.name }`
        const html = `${ resCustomer.name }`
        const subject = data.subject || `${ resCustomer.name } Invitation`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return {
          text: text,
          html: html,
          type: 'customer.invite',
          subject: subject,
          send_email: sendEmail
        }
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
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = foundCustomer

        const text = `${ resCustomer.name }`
        const html = `${ resCustomer.name }`
        const subject = data.subject || `${ resCustomer.name } Invite Accepted`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return {
          text: text,
          html: html,
          type: 'customer.inviteAccepted',
          subject: subject,
          send_email: sendEmail
        }
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
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = foundCustomer

        const text = `${ resCustomer.name }`
        const html = `${ resCustomer.name }`
        const subject = data.subject || `${ resCustomer.name } Account Balance Updated`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return {
          text: text,
          html: html,
          type: 'customer.accountBalanceUpdated',
          subject: subject,
          send_email: sendEmail
        }
      })
  }
  /**
   *
   * @param customer
   * @param data
   * @param options
   * @returns {Promise.<{type: string, subject: string, text: string, html:string, send_email:boolean}>}
   */
  accountBalanceDeducted(customer, data, options) {
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, options)
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Error('Customer did not resolve')
        }
        resCustomer = foundCustomer

        const text = `${ resCustomer.name }`
        const html = `${ resCustomer.name }`
        const subject = data.subject || `${ resCustomer.name } Account Balance Deducted`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true

        return {
          text: text,
          html: html,
          type: 'customer.accountBalanceDeducted',
          subject: subject,
          send_email: sendEmail
        }
      })
  }
}
