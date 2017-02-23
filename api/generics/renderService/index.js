'use strict'
const _ = require('lodash')
const MarkdownIt = require('markdown-it')

module.exports = class DefaultRenderService {
  constructor(options, plugins) {
    this.options = options
    this.plugins = plugins
  }

  /**
   * _init Initializes a new instance of Markdown-it with Plugins
   * @param options
   * @returns {Instance} markdown-it instance
   * @private
   */
  _init(options) {
    // Default the options
    if (!options) {
      options = {}
    }
    // Set options
    options = _.defaults(options, this.options)
    // console.log('RouterRenderService._init', options)

    // Make new instance
    const md = new MarkdownIt(options)

    // Set Plugins additional plugins
    _.each(this.plugins, (plugin) => {
      if (!plugin.options) {
        plugin.options = {}
      }
      md.use(plugin.plugin, plugin.options)
    })
    return md
  }

  /**
   * renders a document into html
   * @param {String} document
   * @param {Object} options (optional)
   * @returns {Object.<{meta: object, document: string}>} markdown-it meta and rendered document
   */
  render(document, options) {
    const md = this._init(options)
    const renderedDocument =  md.render(document)
    const res = {
      document: renderedDocument,
      meta: md.meta || {}
    }
    return Promise.resolve(res)
  }
}
