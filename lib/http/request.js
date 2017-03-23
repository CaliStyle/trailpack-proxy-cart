/* eslint no-underscore-dangle: [0]*/
'use strict'

/**
 * Module dependencies.
 */

const req = module.exports = {}

/**
 * Initiate a login session for `cart`.
 *
 * Options:
 *   - `session`  Save login state in session, defaults to _true_
 *
 * Examples:
 *
 *     req.logInCart(cart, { session: false })
 *
 *     req.logInCart(cart, function(err) {
 *       if (err) { throw err }
 *       // session saved
 *     })
 *
 * @param {Cart} cart
 * @param {Object} options
 * @param {Function} done
 * @api public
 */
req.loginCart =
  req.logInCart = function(cart, options, done) {
    if (typeof options == 'function') {
      done = options
      options = {}
    }
    options = options || {}

    let property = 'cart'
    if (this._proxyCart && this._proxyCart.instance) {
      property = this._proxyCart.instance._cartProperty || 'cart'
    }
    const session = (options.session === undefined) ? true : options.session

    this[property] = cart
    if (session) {
      if (!this._proxyCart) {
        throw new Error('proxyCart.initialize() middleware not in use')
      }
      if (typeof done != 'function') {
        throw new Error('req#loginCart requires a callback function')
      }

      const self = this
      this._proxyCart.instance.serializeCart(cart, this, function(err, obj) {
        if (err) {
          self[property] = null
          return done(err)
        }
        if (!self._proxyCart.session) {
          self._proxyCart.session = {}
        }
        self._proxyCart.session.cart = obj
        if (!self.session) {
          self.session = {}
        }
        self.session[self._proxyCart.instance._key] = self._proxyCart.session
        done()
      })
    }
    else {
      done && done()
    }
  }

/**
 * Initiate a login session for `customer`.
 *
 * Options:
 *   - `session`  Save login state in session, defaults to _true_
 *
 * Examples:
 *
 *     req.logInCustomer(customer, { session: false })
 *
 *     req.logInCustomer(customer, function(err) {
 *       if (err) { throw err }
 *       // session saved
 *     })
 *
 * @param {Customer} customer
 * @param {Object} options
 * @param {Function} done
 * @api public
 */
req.loginCustomer =
  req.logInCustomer = function(customer, options, done) {
    if (typeof options == 'function') {
      done = options
      options = {}
    }
    options = options || {}

    let property = 'customer'
    if (this._proxyCart && this._proxyCart.instance) {
      property = this._proxyCart.instance._customerProperty || 'customer'
    }
    const session = (options.session === undefined) ? true : options.session

    this[property] = customer
    if (session) {
      if (!this._proxyCart) {
        throw new Error('proxyCart.initialize() middleware not in use')
      }
      if (typeof done != 'function') {
        throw new Error('req#loginCustomer requires a callback function')
      }

      const self = this
      this._proxyCart.instance.serializeCustomer(customer, this, function(err, obj) {
        if (err) {
          self[property] = null
          return done(err)
        }
        if (!self._proxyCart.session) {
          self._proxyCart.session = {}
        }
        self._proxyCart.session.customer = obj
        if (!self.session) {
          self.session = {}
        }
        self.session[self._proxyCart.instance._key] = self._proxyCart.session
        done()
      })
    }
    else {
      done && done()
    }
  }

/**
 * Terminate an existing login session.
 *
 * @api public
 */
req.logoutCart =
  req.logOutCart = function() {
    let property = 'cart'
    if (this._proxyCart && this._proxyCart.instance) {
      property = this._proxyCart.instance._cartProperty || 'cart'
    }

    this[property] = null
    if (this._proxyCart && this._proxyCart.session) {
      delete this._proxyCart.session.cart
    }
  }

/**
 * Terminate an existing login session.
 *
 * @api public
 */
req.logoutCustomer =
  req.logOutCustomer = function() {
    let property = 'customer'
    if (this._proxyCart && this._proxyCart.instance) {
      property = this._proxyCart.instance._customerProperty || 'customer'
    }

    this[property] = null
    if (this._proxyCart && this._proxyCart.session) {
      delete this._proxyCart.session.customer
    }
  }

/**
 * Test if request is has a cart.
 *
 * @return {Boolean}
 * @api public
 */
req.hasCart = function() {
  let property = 'cart'
  if (this._proxyCart && this._proxyCart.instance) {
    property = this._proxyCart.instance._cartProperty || 'cart'
  }

  return (this[property]) ? true : false
}

/**
 * Test if request has no cart.
 *
 * @return {Boolean}
 * @api public
 */
req.hasNoCart = function() {
  return !this.hasCart()
}

/**
 * Test if request is has a customer.
 *
 * @return {Boolean}
 * @api public
 */
req.hasCustomer = function() {
  let property = 'customer'
  if (this._proxyCart && this._proxyCart.instance) {
    property = this._proxyCart.instance._customerProperty || 'customer'
  }

  return (this[property]) ? true : false
}

/**
 * Test if request has no customer.
 *
 * @return {Boolean}
 * @api public
 */
req.hasNoCustomer = function() {
  return !this.hasCustomer()
}
