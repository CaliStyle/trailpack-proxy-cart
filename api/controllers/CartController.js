/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')
const lib = require('../../lib')
/**
 * @module CartController
 * @description Cart Controller.
 */
// TODO lock down certain requests by Owner(s)
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
  findById(req, res){
    const orm = this.app.orm
    const Cart = orm['Cart']
    Cart.findIdDefault(req.params.id, {})
      .then(cart => {
        if (!cart) {
          throw new Errors.FoundError(Error(`Cart id ${req.params.id} not found`))
        }
        return res.json(cart)
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
  findAll(req, res){
    const orm = this.app.orm
    const Cart = orm['Cart']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Cart.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(carts => {
        res.set('X-Pagination-Total', carts.count)
        res.set('X-Pagination-Pages', Math.ceil(carts.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(carts.rows)
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
    lib.Validator.validateCart.create(req.body)
      .then(values => {
        return CartService.create(req.body)
      })
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected Error while creating cart')
        }
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
        if (!data) {
          throw new Error('Unexpected Error while checking out')
        }
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
        // console.log('ProductController.addItemsToCart',data)
        if (!data) {
          throw new Error('Unexpected Error while adding items')
        }
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
        if (!data) {
          throw new Error('Unexpected Error while removing items')
        }
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

