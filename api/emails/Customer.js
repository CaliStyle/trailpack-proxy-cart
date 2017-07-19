/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-generics').Email

module.exports = class Customer extends Email {
  /**
   *
   * @param customer
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  invite(customer, options) {
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

        return {
          text: text,
          html: html
        }
      })

  }

  /**
   *
   * @param customer
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  inviteAccepted(customer, options) {
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

        return {
          text: text,
          html: html
        }
      })
  }
}
