/* eslint no-underscore-dangle: [0]*/
/* eslint no-console: [0] */
/**
 * Module dependencies.
 */
// const http = require('http')
// const IncomingMessageExt = require('../http/request')

module.exports = function authenticate(proxyCart, options, callback) {

  if (typeof options == 'function') {
    callback = options
    options = {}
  }
  options = options || {}

  return function auth(req, res, next) {
    // if (
    //   http.IncomingMessage.prototype.logInCart
    //   && http.IncomingMessage.prototype.logInCart !== IncomingMessageExt.logInCart
    //   && http.IncomingMessage.prototype.logInCustomer
    //   && http.IncomingMessage.prototype.logInCustomer !== IncomingMessageExt.logInCustomer
    // ) {
    require('../framework/connect').__monkeypatchNode()
    // }

    if (!req._proxyCart) {
      return this.error(new Error('proxyCart.initialize() middleware not in use'))
    }

    next()
  }
}
