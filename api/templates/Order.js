/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-generics').Template

module.exports = class Order extends Template {
  created(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>
 ${ item.name } x ${item.quantity } - $${ item.calculated_price / 100}
</p>`
    }).join('')

    return `<h1>Order ${ order.name } Created</h1>
<p>Dear Customer,</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>Thank you!</p>`
  }

  updated(order) {
    return `<h1>Order ${ order.name } Updated</h1>
<p></p>
`
  }

  cancelled(order) {
    return `<h1>Order ${ order.name } Cancelled</h1>
<p></p>
`
  }

  fulfilled(order) {
    return `<h1>Order ${ order.name } Fulfilled</h1>
<p></p>
`
  }
  failed(order) {
    return `<h1>Order ${ order.name } Failed</h1>
<p></p>
`
  }
  paid(order) {
    return `<h1>Order ${ order.name } Receipt</h1>
<p></p>
`
  }
  refunded(order) {
    return `<h1>Order ${ order.name } Refunded</h1>
<p></p>
`
  }
}
