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
  generalStats(req, res) {
    res.json({})
  }
  init(req, res) {
    if (!req.cart) {
      if (!req.body) {
        req.body = {}
      }
      if (req.customer) {
        req.body.customer = req.customer.id
      }
      this.app.services.CartService.create(req.body)
        .then(cart => {
          if (!cart) {
            throw new Error('Unexpected Error while creating cart')
          }
          return new Promise((resolve,reject) => {
            req.loginCart(cart, function (err) {
              if (err) {
                return reject(err)
              }
              return resolve(cart)
            })
          })
        })
        .then(cart => {
          return res.json(cart)
        })
        .catch(err => {
          // console.log('ProductController.checkout', err)
          return res.serverError(err)
        })
    }
    else {
      res.json(req.cart)
    }
  }

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
  session(req, res) {
    if (!req.cart) {
      return res.sendStatus(401)
    }
    return res.json(req.cart)
  }
  /**
   *
   * @param req
   * @param res
   */
  findById(req, res){
    const orm = this.app.orm
    const Cart = orm['Cart']
    let id = req.params.id
    if (!id && req.cart) {
      id = req.cart.id
    }
    Cart.findByIdDefault(id, {})
      .then(cart => {
        if (!cart) {
          throw new Errors.FoundError(Error(`Cart id ${id} not found`))
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
        res.set('X-Pagination-Offset', offset)
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

    if (req.customer && !req.body.customer_id) {
      req.body.customer_id = req.customer.id
    }
    if (req.user && !req.body.owners) {
      req.body.owners = [req.user]
    }

    lib.Validator.validateCart.create(req.body)
      .then(values => {
        console.log(values)
        return CartService.create(req.body)
      })
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected Error while creating cart')
        }
        // console.log('THIS CREATED CART', cart)
        return new Promise((resolve,reject) => {
          req.loginCart(cart, function (err) {
            if (err) {
              return reject(err)
            }
            return resolve(cart)
          })
        })
      })
      .then(cart => {
        return res.json(cart)
      })
      .catch(err => {
        // console.log('ProductController.create', err)
        return res.serverError(err)
      })

  }

  /**
   *
   * @param req
   * @param res
   */
  checkout(req, res) {
    if (!req.body.cart) {
      req.body.cart = {}
    }
    if (!req.body.customer) {
      req.body.customer = {}
    }

    const CartService = this.app.services.CartService
    lib.Validator.validateCart.checkout(req.body)
      .then(values => {

        const cartId = req.params.id || req.body.cart.id
        const customerId = req.params.customer || req.body.customer.id

        if (!cartId && req.cart) {
          req.body.cart = req.cart
        }
        else if (cartId){
          req.body.cart.id = cartId
        }

        if (!customerId && req.customer) {
          req.body.customer = req.customer
        }
        else if (customerId) {
          req.body.customer.id = customerId
        }

        if (!req.body.cart.id) {
          throw new Error('Checkout requires a cart session or cart id, or token')
        }
        return CartService.checkout(req)

      })
      .then(data => {
        // console.log('cart checkout CartController.checkout', data)
        if (!data || !data.cart || !data.order) {
          throw new Error('Unexpected Error while checking out')
        }

        return res.json({
          cart: data.cart,
          order: data.order
        })
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
    let id = req.params.id
    if (!id && req.cart) {
      id = req.cart.id
    }
    lib.Validator.validateCart.addItems(req.body)
      .then(values => {
        return CartService.addItemsToCart(req.body, id)
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
    let id = req.params.id
    if (!id && req.cart) {
      id = req.cart.id
    }
    lib.Validator.validateCart.removeItems(req.body)
      .then(values => {
        return CartService.removeItemsFromCart(req.body, id)
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
  // ADMIN ONLY FEATURE
  pricingOverrides(req, res) {
    const CartService = this.app.services.CartService
    let id = req.params.id

    if (!id && req.body.id) {
      id = req.body.id
    }

    if (!id && req.cart) {
      id = req.cart.id
    }

    lib.Validator.validateCart.pricingOverrides(req.body)
      .then(values => {
        return CartService.pricingOverrides(req.body, id, req.user)
      })
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected Error while overriding prices')
        }
        return res.json(cart)
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
    let id = req.params.id
    if (!id && req.cart) {
      id = req.cart.id
    }
    lib.Validator.validateCart.clear(req.body)
      .then(values => {
        return CartService.clearCart(id)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.clearCart', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  login(req, res) {
    let cartId = req.params.id
    let customerId
    const Cart = this.app.orm['Cart']

    if (!cartId && req.user) {
      cartId = req.user.current_cart_id
    }
    if (req.user) {
      customerId = req.user.current_customer_id
    }

    Cart.findById(cartId)
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected Error while authenticating cart')
        }
        if (customerId) {
          cart.customer_id = customerId
          return cart.save()
        }
        return cart
      })
      .then(cart => {
        return new Promise((resolve,reject) => {
          req.loginCart(cart, function (err) {
            if (err) {
              return reject(err)
            }
            return resolve(cart)
          })
        })
      })
      .then(cart => {
        return res.json(cart)
      })
      .catch(err => {
        // console.log('ProductController.clearCart', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  switchCart(req, res) {
    const cartId = req.params.id
    const Cart = this.app.orm['Cart']
    const User = this.app.orm['User']

    if (!cartId || !req.user) {
      const err = new Error('A cart id and a user in session are required')
      return res.serverError(err)
    }
    User.findById(req.user.id)
      .then(user => {
        user.current_cart_id = cartId
        return user.save()
      })
      .then(user => {
        req.user.current_cart_id = cartId
        return Cart.findById(cartId)
      })
      .then(cart => {
        cart.customer_id = req.user.current_customer_id
        return cart.save()
      })
      .then(cart => {
        return new Promise((resolve, reject) => {
          req.loginCart(cart, (err) => {
            if (err) {
              return reject(err)
            }
            return resolve(cart)
          })
        })
      })
      .then(cart => {
        return res.json(cart)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  logout(req, res) {
    req.logoutCart()
    res.ok()
  }
  //TODO
  addCoupon(req, res) {}
}

