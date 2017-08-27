/* eslint no-underscore-dangle: [0]*/
/* eslint no-console: [0] */
/**
 * Module dependencies.
 */
// const http = require('http')
// const IncomingMessageExt = require('../http/request')

module.exports = function cart(proxyCart, options, callback) {

  if (typeof options == 'function') {
    callback = options
    options = {}
  }
  options = options || {}

  return function cart(req, res, next) {
    if (!req._proxyCart) {
      return this.error(new Error('proxyCart.initialize() middleware not in use'))
    }

    if (req.session && req.session[req._proxyCart.instance._key]) {
      const property = req._proxyCart.instance._cartProperty || 'cart'
      const cartS = req.session[req._proxyCart.instance._key][property]
      if (cartS) {
        req._proxyCart.instance.deserializeCart(cartS, req, (err, cart) => {
          if (err) {
            return next(err)
          }
          if (!cart) {
            delete req._proxyCart.session[property]
          }
          else {
            req[property] = cart
          }
          return next()
        })
      }
      else {
        return next()
      }
    }
    else {
      return next()
    }
  }
}
