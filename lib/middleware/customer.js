/* eslint no-underscore-dangle: [0]*/
/* eslint no-console: [0] */
/**
 * Module dependencies.
 */
// const http = require('http')
// const IncomingMessageExt = require('../http/request')

module.exports = function customer(proxyCart, options, callback) {

  if (typeof options == 'function') {
    callback = options
    options = {}
  }
  options = options || {}

  return function customer(req, res, next) {
    if (!req._proxyCart) {
      return this.error(new Error('proxyCart.initialize() middleware not in use'))
    }

    if (req.session && req.session[req._proxyCart.instance._key]) {
      const property = req._proxyCart.instance._customerProperty || 'customer'
      const customerS = req.session[req._proxyCart.instance._key][property]
      if (customerS) {
        req._proxyCart.instance.deserializeCustomer(customerS, req, (err, customer) => {
          if (err) {
            return next(err)
          }
          if (!customer) {
            delete req._proxyCart.session[property]
          }
          else {
            req[property] = customer
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
