/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-generics').Template

module.exports = class Order extends Template {
  created(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('')

    return `<h1>Order ${ order.name } Created</h1>
<p>Dear ${order.Customer ? order.Customer.name || order.Customer.company || 'Customer' : 'Customer'},</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price / 100, order.currency)}</p>
<p>------------------------</p>
<p>Thank you!</p>`
  }

  updated(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('')

    return `<h1>Order ${ order.name } was updated</h1>
<p>Dear ${order.Customer ? order.Customer.name || order.Customer.company || 'Customer' : 'Customer'},</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>Thank you!</p>`
  }

  cancelled(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('')

    return `<h1>Order ${ order.name } Cancelled</h1>
<p>Dear ${order.Customer ? order.Customer.name || order.Customer.company || 'Customer' : 'Customer'},</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>Thank you!</p>`
  }

  fulfilled(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('')

    return `<h1>Order ${ order.name } Fulfilled</h1>
<p>Dear ${order.Customer ? order.Customer.name || order.Customer.company || 'Customer' : 'Customer'},</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>Thank you!</p>`
  }
  failed(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('')

    return `<h1>Order ${ order.name } failed to process</h1>
<p>Dear ${order.Customer ? order.Customer.name || order.Customer.company || 'Customer' : 'Customer'},</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>Thank you!</p>`
  }

  /**
   *
   * @param order
   * @returns {string}
   */
  paid(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('')

    return `<h1>Order ${ order.name } Receipt</h1>
<p>Dear ${order.Customer ? order.Customer.name || order.Customer.company || 'Customer' : 'Customer'},</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price, order.currency)}</p>
<p>------------------------</p>
<p>Thank you!</p>`
  }
  refunded(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('')

    return `<h1>Order ${ order.name } Refunded</h1>
<p>Dear ${order.Customer ? order.Customer.name || order.Customer.company || 'Customer' : 'Customer'},</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price, order.currency)}</p>
<p>Refunded: ${ this.app.services.ProxyCartService.formatCurrency(order.total_refunds, order.currency)}</p>
<p>------------------------</p>
<p>Thank you!</p>`
  }
}
