/* eslint no-underscore-dangle: [0]*/
/* eslint no-console: [0] */
/**
 * Module dependencies.
 */
// const http = require('http')
// const IncomingMessageExt = require('../http/request')

module.exports = function session(proxyCart, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options = {}
  }
  options = options || {}

  return function session(req, res, next) {
    // if (
    //   http.IncomingMessage.prototype.logInCart
    //   && http.IncomingMessage.prototype.logInCart !== IncomingMessageExt.logInCart
    //   && http.IncomingMessage.prototype.logInCustomer
    //   && http.IncomingMessage.prototype.logInCustomer !== IncomingMessageExt.logInCustomer
    // ) {
    require('../framework/connect').__monkeypatchNode()
    // }
    // console.log('loginCart',req.loginCart)
    next()
  }
}
