/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-generics').Template

module.exports = class Order extends Template {
  created(order) {
    return `<h1>Order ${ order.name } Created</h1>
<p></p>
`
  }
  fulfilled(order) {
    return `<h1>Order ${ order.name } Fulfilled</h1>
<p></p>
`
  }
}
