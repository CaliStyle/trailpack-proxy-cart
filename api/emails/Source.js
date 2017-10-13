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

        const text = data.text || `Payment Method ${ resSource.token } will expire`
        const html = data.html || this.app.templates.Source.willExpire(resSource)
        const subject = data.subject || `Payment Method ${ resSource.token } will expire`
        const sendEmail = typeof data.send_email !== 'undefined' ? data.send_email : true
        this.app.log.debug(`SOURCE WILL EXPIRE SEND EMAIL ${ resSource.token }`, sendEmail)

        return {
          type: 'source.willExpire',
          subject: subject,
          text: text,
          html: html,
          send_email: sendEmail
        }
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

        const text = `${ resSource.name }`
        const html = `${ resSource.name }`

        return {
          text: text,
          html: html
        }
      })
  }
}
