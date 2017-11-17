/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-email').Template

module.exports = class Order extends Template {
  created(order) {
    let orderItems = '<h5>Order Items</h5>'
    orderItems = orderItems + `
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Qty</th>
      <th>Price</th>
    </tr>
  </thead>
<tbody>`

    orderItems = orderItems + order.order_items.map(item => {
      return `
<tr>
  <td>${ item.name }</td>
  <td>${item.quantity }</td>
  <td>${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</td>
</tr>`
    }).join('\n')

    orderItems = orderItems + '</tbody></table>'

    let taxes = '', taxesTotal = ''
    if (order.tax_lines.length > 0) {
      taxes = '<h5>Taxes</h5>\n'
      taxes = taxes + order.tax_lines.map(item => {
        return `<p>${ item.name } ${ this.app.services.ProxyCartService.formatCurrency(item.price, order.currency)}</p>`
      }).join('\n')

      taxesTotal = `<p>Taxes: ${ this.app.services.ProxyCartService.formatCurrency(order.total_tax, order.currency)}</p>`
    }

    let shipping = '', shippingTotal = ''
    if (order.shipping_lines.length > 0) {
      shipping = '<h5>Shipping</h5>\n'
      shipping = shipping + order.shipping_lines.map(item => {
        return `<p>${ item.name } ${ this.app.services.ProxyCartService.formatCurrency(item.price, order.currency)}</p>`
      }).join('\n')

      shippingTotal = `<p>Shipping: ${ this.app.services.ProxyCartService.formatCurrency(order.total_shipping, order.currency)}</p>`
    }

    let discounted = '', discountedTotal = ''
    if (order.discounted_lines.length > 0) {
      discounted = '<h5>discounted</h5>\n'
      discounted = discounted + order.discounted_lines.map(item => {
        return `<p>${ item.name } - ${ this.app.services.ProxyCartService.formatCurrency(item.price, order.currency)}</p>`
      }).join('\n')

      discountedTotal = `<p>Discounts: - ${ this.app.services.ProxyCartService.formatCurrency(order.total_discounts, order.currency)}</p>\n`
    }

    let overrides = '', overridesTotal = ''
    if (order.pricing_overrides.length > 0) {
      overrides = '<h5>Price Overrides</h5>\n'
      overrides = overrides + order.pricing_overrides.map(item => {
        return `<p>${ item.name } - ${ this.app.services.ProxyCartService.formatCurrency(item.price, order.currency)}</p>`
      }).join('\n')

      overridesTotal = `<p>Price Overrides: - ${ this.app.services.ProxyCartService.formatCurrency(order.total_discounts, order.currency)}</p>\n`
    }

    return `<h1>Order ${ order.name } Created</h1>
<p>Dear ${order.Customer ? order.Customer.getSalutation() : 'Customer'},</p>
<p>Your order was created and is being processed.</p>
<p>Order Number: ${ order.name }</p>
${orderItems}${discounted}${overrides}${shipping}${taxes}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
${discountedTotal}${overridesTotal}${shippingTotal}${taxesTotal}
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price, order.currency)}</p>
<p>------------------------</p>
<p>Thank you!</p>`
  }

  updated(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('\n')

    return `<h1>Order ${ order.name } was updated</h1>
<p>Dear ${order.Customer ? order.Customer.getSalutation() : 'Customer'},</p>
<p>Your order has been updated.</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>Thank you!</p>`
  }

  cancelled(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('\n')

    let refunded
    if (order.refunded_lines.length > 0) {
      refunded = '<h5>Refunded</h5>'
      refunded = refunded + order.refunded_lines.map(item => {
        return `<p>${ item.name } - ${ this.app.services.ProxyCartService.formatCurrency(item.price, order.currency)}</p>`
      }).join('\n')
    }

    return `<h1>Order ${ order.name } Cancelled</h1>
<p>Dear ${order.Customer ? order.Customer.getSalutation() : 'Customer'},</p>
<p>Your order has been cancelled.</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
${refunded}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price, order.currency)}</p>
<p>Refunded: ${ this.app.services.ProxyCartService.formatCurrency(order.total_refunds, order.currency)}</p>
<p>------------------------</p>
<p>Thank you!</p>`
  }

  fulfilled(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('\n')

    return `<h1>Order ${ order.name } Fulfilled</h1>
<p>Dear ${order.Customer ? order.Customer.getSalutation() : 'Customer'},</p>
<p>Your order has been fulfilled.</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>Thank you!</p>`
  }

  failed(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('\n')

    return `<h1>Order ${ order.name } failed to process</h1>
<p>Dear ${order.Customer ? order.Customer.getSalutation() : 'Customer'},</p>
<p>Your payment failed.</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price, order.currency)}</p>
<p>Total Still Due: ${ this.app.services.ProxyCartService.formatCurrency(order.total_due, order.currency)}</p>
<p>------------------------</p>
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
    }).join('\n')

    return `<h1>Order ${ order.name } Receipt</h1>
<p>Dear ${order.Customer ? order.Customer.getSalutation() : 'Customer'},</p>
<p>Your payment is complete.</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price, order.currency)}</p>
<p>------------------------</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param order
   * @returns {string}
   */
  partiallyPaid(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('\n')

    return `<h1>Order ${ order.name } Receipt</h1>
<p>Dear ${order.Customer ? order.Customer.getSalutation() : 'Customer'},</p>
<p>Your order has been partially paid.</p>
<p>Order Number: ${ order.name }</p>
<h5>Order Items</h5>
${orderItems}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price, order.currency)}</p>
<p>Total Still Due: ${ this.app.services.ProxyCartService.formatCurrency(order.total_due, order.currency)}</p>
<p>------------------------</p>
<p>Thank you!</p>`
  }

  refunded(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('\n')

    return `<h1>Order ${ order.name } Refunded</h1>
<p>Dear ${order.Customer ? order.Customer.getSalutation() : 'Customer'},</p>
<p>Your payment has been refunded.</p>
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
