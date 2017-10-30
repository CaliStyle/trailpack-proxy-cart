/* eslint no-console: [0] */
'use strict'

const Email = require('trailpack-proxy-email').Email

module.exports = class Source extends Email {
  /**
   *
   * @param source
   * @param data
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  willExpire(source, data, options) {
    options = options || {}
    data = data || {}
    const Source = this.app.orm['Source']
    let resSource
    return Source.resolve(source, options)
      .then(_source => {
        if (!_source) {
          throw new Error('Source did not resolve')
        }
        resSource = _source

        return resSource.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {
        const subject = data.subject || `Payment Method ${ resSource.token } will expire`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SOURCE WILL EXPIRE SEND EMAIL ${ resSource.token }`, sendEmail)

        return this.compose('willExpire', subject, resSource, sendEmail)
      })
  }

  /**
   *
   * @param source
   * @param data
   * @param options
   * @returns {Promise.<{text: string, html:string}>}
   */
  expired(source, data, options) {
    const Source = this.app.orm['Source']
    let resSource
    return Source.resolve(source, options)
      .then(foundSource => {
        if (!foundSource) {
          throw new Error('Source did not resolve')
        }
        resSource = foundSource

        return resSource.resolveCustomer({transaction: options.transaction || null})
      })
      .then(() => {
        const subject = data.subject || `Payment Method ${ resSource.token } expired`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SOURCE EXPIRED SEND EMAIL ${ resSource.token }`, sendEmail)

        return this.compose('expired', subject, resSource, sendEmail)
      })
  }
}
