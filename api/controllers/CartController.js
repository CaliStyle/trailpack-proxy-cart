/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
/**
 * @module CartController
 * @description Cart Controller.
 */
module.exports = class CartController extends Controller {
  /**
   * count the amount of carts
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Cart')
      .then(count => {
        const counts = {
          carts: count
        }
        return res.json(counts)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  create(req, res) {
    const CartService = this.app.services.CartService
    CartService.create(req.body)
      .then(cart => {
        return res.json(cart)
      })
      .catch(err => {
        // console.log('ProductController.checkout', err)
        return res.serverError(err)
      })

  }

  /**
   *
   * @param req
   * @param res
   */
  checkout(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCart.checkout(req.body)
      .then(values => {
        if (!req.body.cart) {
          req.body.cart = {}
        }
        req.body.cart.id = req.params.id
        return CartService.checkout(req.body)
      })
      .then(data => {
        // console.log('CartController.checkout Order', data)
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.checkout', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addItems(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCart.addItems(req.body)
      .then(values => {
        return CartService.addItemsToCart(req.body, req.params.id)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.addItemsToCart', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeItems(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCart.removeItems(req.body)
      .then(values => {
        return CartService.removeItemsFromCart(req.body, req.params.id)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeItemsFromCart', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  clear(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCart.clear(req.body)
      .then(values => {
        return CartService.clearCart(req.params.id)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.clearCart', err)
        return res.serverError(err)
      })
  }

  //TODO
  addCoupon(req, res) {}
}

