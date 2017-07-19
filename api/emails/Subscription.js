/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-generics').Email

module.exports = class Subscription extends Email {
  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  cancelled(subscription, options) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription

        const text = `${ resSubscription.name }`
        const html = `${ resSubscription.name }`

        return {
          text: text,
          html: html
        }
      })

  }
  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  failed(subscription, options) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription

        const text = `${ resSubscription.name }`
        const html = `${ resSubscription.name }`

        return {
          text: text,
          html: html
        }
      })

  }
  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  renewed(subscription, options) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription

        const text = `${ resSubscription.name }`
        const html = `${ resSubscription.name }`

        return {
          text: text,
          html: html
        }
      })

  }
  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  willRenew(subscription, options) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription

        const text = `${ resSubscription.name }`
        const html = `${ resSubscription.name }`

        return {
          text: text,
          html: html
        }
      })

  }
  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  activated(subscription, options) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription

        const text = `${ resSubscription.name }`
        const html = `${ resSubscription.name }`

        return {
          text: text,
          html: html
        }
      })

  }
  /**
   *
   * @param subscription
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  deactivated(subscription, options) {
    const Subscription = this.app.orm['Subscription']
    let resSubscription
    return Subscription.resolve(subscription, options)
      .then(foundSubscription => {
        if (!foundSubscription) {
          throw new Error('Subscription did not resolve')
        }
        resSubscription = foundSubscription

        const text = `${ resSubscription.name }`
        const html = `${ resSubscription.name }`

        return {
          text: text,
          html: html
        }
      })
  }
}
