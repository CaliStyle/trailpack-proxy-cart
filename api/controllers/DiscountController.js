/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')

/**
 * @module DiscountController
 * @description Generated Trails.js Controller.
 */
module.exports = class DiscountController extends Controller {
  /**
   *
   * @param req
   * @param res
   */
  generalStats(req, res) {
    res.json({})
  }

  /**
   *
   * @param req
   * @param res
   */
  findById(req, res) {
    const orm = this.app.orm
    const Discount = orm['Discount']
    const id = req.params.id

    Discount.findById(id, {})
      .then(discount => {
        if (!discount) {
          throw new Errors.FoundError(Error(`Discount id ${id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
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
  findByHandle(req, res) {
    const orm = this.app.orm
    const Discount = orm['Discount']
    const handle = req.params.handle

    Discount.findOne({
      where: {
        handle: handle
      }
    })
      .then(discount => {
        if (!discount) {
          throw new Errors.FoundError(Error(`Discount handle ${handle} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
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
  findAll(req, res) {
    const orm = this.app.orm
    const Discount = orm['Discount']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Discount.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(discounts => {
        this.app.services.ProxyEngineService.paginate(res, discounts.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discounts.rows)
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
    const DiscountService = this.app.services.DiscountService

    req.body = req.body || {}

    lib.Validator.validateDiscount.create(req.body)
      .then(values => {
        return DiscountService.create(req.body)
      })
      .then(discount => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
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
  update(req, res) {
    const DiscountService = this.app.services.DiscountService

    const discountID = req.params.id
    req.body = req.body || {}

    lib.Validator.validateDiscount.update(req.body)
      .then(values => {
        return DiscountService.update(discountID, req.body)
      })
      .then(discount => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
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
  destroy(req, res) {
    const DiscountService = this.app.services.DiscountService

    const discountID = req.params.id

    lib.Validator.validateDiscount.destroy(discountID)
      .then(values => {
        return DiscountService.destroy(discountID)
      })
      .then(discount => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discount)
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
  addProduct(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.addProduct(req.params.id, req.params.product)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('ProductController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addProducts(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.addProducts(req.params.id, req.body)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('ProductController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeProduct(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.removeProduct(req.params.id, req.params.product)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('ProductController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  products(req, res) {
    const Product = this.app.orm['Product']
    const discountId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!discountId) {
      const err = new Error('A discount id is required')
      return res.send(401, err)
    }

    Product.findAndCountDefault({
      order: sort,
      include: [
        {
          model: this.app.orm['Discount'],
          as: 'discounts',
          where: {
            id: discountId
          }
        }
      ],
      offset: offset,
      limit: limit
    })
      .then(products => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, products.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products.rows)
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
  addCustomer(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.addCustomer(req.params.id, req.params.customer)
      .then(customer => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addCustomers(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.addCustomers(req.params.id, req.body)
      .then(customer => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeCustomer(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.removeCustomer(req.params.id, req.params.customer)
      .then(customer => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  customers(req, res) {
    const Customer = this.app.orm['Customer']
    const discountId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!discountId) {
      const err = new Error('A discount id is required')
      return res.send(401, err)
    }

    Customer.findAndCountDefault({
      order: sort,
      include: [
        {
          model: this.app.orm['Discount'],
          as: 'discounts',
          where: {
            id: discountId
          }
        }
      ],
      offset: offset,
      limit: limit
    })
      .then(customers => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, customers.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customers.rows)
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
  addCart(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.addCart(req.params.id, req.params.cart)
      .then(cart => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CartController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeCart(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.removeCart(req.params.id, req.params.cart)
      .then(cart => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cart)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CartController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  carts(req, res) {
    const Cart = this.app.orm['Cart']
    const discountId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!discountId) {
      const err = new Error('A cart id is required')
      return res.send(401, err)
    }

    Cart.findAndCount({
      order: sort,
      include: [
        {
          model: this.app.orm['Discount'],
          as: 'discounts',
          where: {
            id: discountId
          }
        }
      ],
      offset: offset,
      limit: limit
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
  addCollection(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.addCollection(req.params.id, req.params.collection)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CollectionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addCollections(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.addCollections(req.params.id, req.body)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CollectionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeCollection(req, res) {
    const DiscountService = this.app.services.DiscountService

    DiscountService.removeCollection(req.params.id, req.params.collection)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CollectionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  collections(req, res) {
    const Collection = this.app.orm['Collection']
    const discountId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!discountId) {
      const err = new Error('A collection id is required')
      return res.send(401, err)
    }

    Collection.findAndCountDefault({
      order: sort,
      include: [
        {
          model: this.app.orm['Discount'],
          as: 'discounts',
          where: {
            id: discountId
          }
        }
      ],
      offset: offset,
      limit: limit
    })
      .then(collections => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, collections.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collections.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

