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
