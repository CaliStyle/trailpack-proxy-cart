/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-email').Template

module.exports = class Subscription extends Template {
  /**
   *
   * @param subscription
   * @returns {string}
   */
  cancelled(subscription) {
    return `<h1>Subscription ${ subscription.token } Cancelled</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
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
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription failed to renew.</p>
<p>To avoid cancellation of your subscription, please update your payment method or contact customer services.</p>
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  renewed(subscription) {
    const subscriptionItems = subscription.line_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, subscription.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ subscription.token } Renewed</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Subscription Subscription Number: ${ subscription.name }</p>
<h5>Subscription Items</h5>
${subscriptionItems}
<p>------------------------</p>
<p>Subtotal: ${ this.app.services.ProxyCartService.formatCurrency(subscription.subtotal_price, subscription.currency)}</p>
<p>Total: ${ this.app.services.ProxyCartService.formatCurrency(subscription.total_price, subscription.currency)}</p>
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
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
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
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
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
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
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
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription will renew shortly.</p>
<p>Thank you!</p>`
  }
}
