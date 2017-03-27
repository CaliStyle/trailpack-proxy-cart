/* eslint no-console: [0] */
/* eslint no-underscore-dangle: [0]*/
'use strict'

const Policy = require('trails/policy')
/**
 * @module CartPolicy
 * @description Cart Policy
 */
module.exports = class CartPolicy extends Policy {
  session(req, res, next) {
    // console.log('Cart Policy',req.cart)
    let err
    if (!req.cart) {
      err = new Error('session requires a cart')
    }
    next(err)
  }
}

