/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-generics').Email

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
        const sendEmail = data.send_email || true

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
        const sendEmail = data.send_email || true

        return {
          text: text,
          html: html,
          type: 'customer.invite.accepted',
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
        const sendEmail = data.send_email || true

        return {
          text: text,
          html: html,
          type: 'customer.account_balance.updated',
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
        const sendEmail = data.send_email || true

        return {
          text: text,
          html: html,
          type: 'customer.account_balance.deducted',
          subject: subject,
          send_email: sendEmail
        }
      })
  }
}
