/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-generics').Template

module.exports = class Subscription extends Template {
  /**
   *
   * @param subscription
   * @returns {string}
   */
  cancelled(subscription) {
    return `<h1>Subscription ${ subscription.token } Cancelled</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.full_name || subscription.Customer.company || 'Customer' : 'Customer'},</p>
<p>Your subscription was cancelled.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  failed(subscription) {
    return `<h1>Subscription ${ subscription.token } Failed to Renew</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.full_name || subscription.Customer.company || 'Customer' : 'Customer'},</p>
<p>Your subscription failed to renew.</p>
<p>To avoid cancellation of your subscription, please update your payment method or contact customer services.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param order
   * @returns {string}
   */
  renewed(order) {
    const orderItems = order.order_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, order.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ order.subscription_token } Renewed</h1>
<p>Dear ${order.Customer ? order.Customer.full_name || order.Customer.company || 'Customer' : 'Customer'},</p>
<p>Subscription Order Number: ${ order.name }</p>
<h5>Subscription Items</h5>
${orderItems}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(order.subtotal_price, order.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(order.total_price, order.currency)}</p>
<p>------------------------</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  activated(subscription) {
    return `<h1>Subscription ${ subscription.token } Activated</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.full_name || subscription.Customer.company || 'Customer' : 'Customer'},</p>
<p>Your subscription has been reactivated.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  deactivated(subscription) {
    return `<h1>Subscription ${ subscription.token } Deactivated</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.full_name || subscription.Customer.company || 'Customer' : 'Customer'},</p>
<p>Your subscription has been deactivated and will cancel at the end of this billing period.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  updated(subscription) {
    return `<h1>Subscription ${ subscription.token } Updated</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.full_name || subscription.Customer.company || 'Customer' : 'Customer'},</p>
<p>Your subscription has been updated.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  willRenew(subscription) {
    return `<h1>Subscription ${ subscription.token } Will Renew</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.full_name || subscription.Customer.company || 'Customer' : 'Customer'},</p>
<p>Your subscription will renew shortly.</p>
<p>Thank you!</p>`
  }
}
