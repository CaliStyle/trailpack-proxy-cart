/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
/**
 * @module CartController
 * @description Cart Controller.
 */
module.exports = class CartController extends Controller {

  checkout(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCheckout(req.body)
      .then(values => {
        return CartService.checkout(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.checkout', err)
        return res.serverError(err)
      })
  }
  addItems(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateAddItemsToCart(req.body)
      .then(values => {
        return CartService.addItemsToCart(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.addItemsToCart', err)
        return res.serverError(err)
      })
  }
  removeItems(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateRemoveItemsFromCart(req.body)
      .then(values => {
        return CartService.removeItemsFromCart(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeItemsFromCart', err)
        return res.serverError(err)
      })
  }
  clear(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateClearCart(req.body)
      .then(values => {
        return CartService.clearCart(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.clearCart', err)
        return res.serverError(err)
      })
  }
}

