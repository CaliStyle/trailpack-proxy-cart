/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-email').Template

module.exports = class Customer extends Template {
  retarget(customer) {

    return `<h1>You have items still in your cart!</h1>
<p>Dear ${customer ? customer.getSalutation() : 'Customer'},</p>
<p>You still have some items in your cart that we didn't want you to forget about.</p>
<p>Feel free to visit us at any time to complete your purchase.</p>
<p>Thanks!</p>
`

  }
}
