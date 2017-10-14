/* eslint no-console: [0] */
'use strict'

const Template = require('trailpack-proxy-email').Template
const moment = require('moment')

module.exports = class Subscription extends Template {
  /**
   *
   * @param subscription
   * @returns {string}
   */
  cancelled(subscription) {
    let cancelTime = new Date(subscription.cancelled_at)
    cancelTime = moment(cancelTime).format('LLLL')

    const subscriptionItems = subscription.line_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, subscription.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ subscription.token } Cancelled</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription was cancelled at ${cancelTime}.</p>
<h5>Subscription Items</h5>
${subscriptionItems}
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  failed(subscription) {

    // let cancelTime = new Date(subscription.cancelled_at)
    // cancelTime = moment(cancelTime).format('LLLL')

    const subscriptionItems = subscription.line_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, subscription.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ subscription.token } Failed to Renew</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription failed to renew.</p>
<p>To avoid cancellation of your subscription, please update your payment method or contact customer services.</p>
<p>Subscription Order Number: ${ subscription.last_order.name }</p>
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
  renewed(subscription) {
    // let renewTime = new Date(subscription.renewed_at)
    // renewTime = moment(renewTime).format('LLLL')
    let renewOnTime = new Date(subscription.renews_on)
    renewOnTime = moment(renewOnTime).format('LLLL')

    const subscriptionItems = subscription.line_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, subscription.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ subscription.token } Renewed</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription has renewed.</p>
<p>Subscription Order Number: ${ subscription.last_order.name }</p>
<p>Next renewal date: ${renewOnTime}</p>
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
    let renewTime = new Date(subscription.renewed_at)
    renewTime = moment(renewTime).format('LLLL')

    let renewOnTime = new Date(subscription.renews_on)
    renewOnTime = moment(renewOnTime).format('LLLL')

    const subscriptionItems = subscription.line_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, subscription.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ subscription.token } Activated</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription has been activated.</p>
<p>Start date: ${renewTime}</p>
<p>Next renewal date: ${renewOnTime}</p>
<h5>Subscription Items</h5>
${subscriptionItems}
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  deactivated(subscription) {
    let renewTime = new Date(subscription.renewed_at)
    renewTime = moment(renewTime).format('LLLL')

    let renewOnTime = new Date(subscription.renews_on)
    renewOnTime = moment(renewOnTime).format('LLLL')

    const subscriptionItems = subscription.line_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, subscription.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ subscription.token } Deactivated</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription has been deactivated and will be cancelled at the end of this billing period.</p>
<p>Start date: ${renewTime}</p>
<p>Cancellation date: ${renewOnTime}</p>
<h5>Subscription Items</h5>
${subscriptionItems}
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  updated(subscription) {
    let renewTime = new Date(subscription.renewed_at)
    renewTime = moment(renewTime).format('LLLL')

    let renewOnTime = new Date(subscription.renews_on)
    renewOnTime = moment(renewOnTime).format('LLLL')

    const subscriptionItems = subscription.line_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, subscription.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ subscription.token } Updated</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription has been updated.</p>
<p>Start date: ${renewTime}</p>
<p>Next renewal date: ${renewOnTime}</p>
<h5>Subscription Items</h5>
${subscriptionItems}
<p>Thank you!</p>`
  }

  /**
   *
   * @param subscription
   * @returns {string}
   */
  willRenew(subscription) {
    let renewOnTime = new Date(subscription.renews_on)
    renewOnTime = moment(renewOnTime).format('LLLL')

    const subscriptionItems = subscription.line_items.map(item => {
      return `<p>${ item.name } x ${item.quantity } - ${ this.app.services.ProxyCartService.formatCurrency(item.calculated_price, subscription.currency)}</p>`
    }).join('')

    return `<h1>Subscription ${ subscription.token } Will Renew</h1>
<p>Dear ${subscription.Customer ? subscription.Customer.getSalutation() : 'Customer'},</p>
<p>Your subscription will renew on ${renewOnTime}.</p>
<h5>Subscription Items</h5>
${subscriptionItems}
<p>Thank you!</p>`
  }
}
