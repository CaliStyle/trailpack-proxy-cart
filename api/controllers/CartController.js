/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')
const lib = require('../../lib')
const CART_STATUS = require('../../lib').Enums.CART_STATUS

/**
 * @module CartController
 * @description Cart Controller.
 */
// TODO lock down certain requests by Owner(s)
module.exports = class CartController extends Controller {
  generalStats(req, res) {
    res.json({})
  }

  /**
   *
   * @param req
   * @param res
   */
  // TODO perhaps we should update the cart if there is one in session and this is a post request?
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
          return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
        })
        .then(result => {
          return res.json(result)
        })
        .catch(err => {
          this.app.log.error('CartController.init', err)
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
    return this.app.orm['Cart'].findByIdDefault(req.cart.id)
      .then(cart => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
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
    Cart.findByIdDefault(req.params.id, {})
      .then(cart => {
        if (!cart) {
          throw new Errors.FoundError(Error(`Cart id ${req.params.id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
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
  resolve(req, res){
    const Cart = this.app.orm['Cart']

    if (!req.params.id) {
      const err =  new Error('id is required')
      return res.serverError(err)
    }

    Cart.resolve(req.params.id, {})
      .then(cart => {
        if (!cart) {
          throw new Errors.FoundError(Error(`Cart ${req.params.id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
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
    const Cart = this.app.orm['Cart']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = req.query.where
    const include = req.query.include || []

    Cart.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where,
      include: include
    })
      .then(carts => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, carts.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, carts.rows)
      })
      .then(result => {
        return res.json(result)
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
  customer(req, res){
    const orm = this.app.orm
    const Cart = orm['Cart']
    const Customer = orm['Customer']
    Cart.findById(req.params.id, {
      attributes: ['id', 'customer_id']
    })
      .then(cart => {
        if (!cart) {
          throw new Errors.FoundError(Error(`Cart id ${ req.params.id } not found`))
        }
        if (!cart.customer_id) {
          throw new Errors.FoundError(Error(`Cart id ${ req.params.id } customer not found`))
        }
        return Customer.findById(cart.customer_id)
      })
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error(`Cart id ${ req.params.id } customer not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
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
        return CartService.create(req.body)
      })
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.create', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  draft(req, res) {
    const CartService = this.app.services.CartService
    req.body.status = CART_STATUS.DRAFT
    lib.Validator.validateCart.create(req.body)
      .then(values => {
        return CartService.create(req.body)
      })
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected Error while creating cart')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.draft', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  update(req, res) {
    const CartService = this.app.services.CartService
    let id = req.params.id
    // if no id through endpoint, use the session endpoint
    if (!id && req.body.id) {
      id = req.body.id
    }
    else if (!id && req.body.token) {
      id = req.body.token
    }
    else if (!id && req.cart) {
      id = req.cart.id
    }
    // If customer logged in and no customer in body, use customer id
    if (req.customer && !req.body.customer_id) {
      req.body.customer_id = req.customer.id
    }
    // if user logged in and no owners in body add user
    if (req.user && !req.body.owners) {
      req.body.owners = [req.user]
    }
    lib.Validator.validateCart.update(req.body)
      .then(values => {
        return CartService.update(id, req.body)
      })
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.update', err)
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
        const customerId = req.params.customer || req.body.customer.id || req.body.cart.customer_id

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
        if (!data || !data.cart || !data.order) {
          throw new Error('Unexpected Error while checking out')
        }
        // TODO sanitize this
        return res.json({
          cart: data.cart,
          order: data.order
        })
      })
      .catch(err => {
        this.app.log.error('CartController.checkout', err)
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
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected Error while adding items')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.addItems', err)
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
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected Error while removing items')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.removeItems', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addShipping(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCart.addShipping(req.body)
      .then(values => {
        return CartService.addShipping(req.params.id, req.body)
      })
      .then(cart => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.addShipping', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeShipping(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCart.removeShipping(req.body)
      .then(values => {
        return CartService.removeShipping(req.params.id, req.body)
      })
      .then(cart => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.removeShipping', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addTaxes(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCart.addTaxes(req.body)
      .then(values => {
        return CartService.addTaxes(req.params.id, req.body)
      })
      .then(cart => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.addTaxes', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeTaxes(req, res) {
    const CartService = this.app.services.CartService
    lib.Validator.validateCart.removeTaxes(req.body)
      .then(values => {
        return CartService.removeTaxes(req.params.id, req.body)
      })
      .then(cart => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.removeTaxes', err)
        return res.serverError(err)
      })
  }

  /**
   * ADMIN ONLY FEATURE
   * @param req
   * @param res
   */
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.pricingOverrides', err)
        return res.serverError(err)
      })
  }

  /**
   * Clears a cart of items
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
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected error while clearing cart')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.clear', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  login(req, res) {
    const Cart = this.app.orm['Cart']

    let cartId = req.params.id
    let customerId

    if (!cartId && req.user) {
      cartId = req.user.current_cart_id
    }

    if (req.user) {
      customerId = req.user.current_customer_id
    }

    Cart.resolve(cartId)
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
        if (!cart) {
          throw new Error('Unexpected Error while login cart in')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('ProductController.clearCart', err)
        this.app.log.error('CartController.login', err)
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
    let resCart
    Cart.resolve(cartId)
      .then(foundCart => {
        if (!foundCart) {
          throw new Error('Unable to resolve cart')
        }
        resCart = foundCart
        return User.findById(req.user.id)
      })
      .then(user => {
        user.current_cart_id = resCart.id
        return user.save()
      })
      .then(user => {
        req.user.current_cart_id = resCart.id
        resCart.customer_id = req.user.current_customer_id
        return resCart.save()
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          req.loginCart(resCart, (err) => {
            if (err) {
              return reject(err)
            }
            return resolve(resCart)
          })
        })
      })
      .then(cart => {
        if (!cart) {
          throw new Error('Unexpected Error while switching cart')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        this.app.log.error('CartController.switchCart', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  logout(req, res) {
    req.logoutCart()
    res.ok()
  }

  /**
   * TODO
   * @param req
   * @param res
   */
  addCoupon(req, res) {

  }

  /**
   * TODO
   * @param req
   * @param res
   */
  removeCoupon(req, res) {

  }
}

