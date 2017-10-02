/* eslint no-console: [0] */
'use strict'

// const Controller = require('trails/controller')
const ModelPermissions = require('trailpack-proxy-permissions/api/controllers/UserController')
/**
 * @module UserController
 * @description Generated Trails.js Controller.
 */
module.exports = class UserController extends ModelPermissions {

  /**
   *
   * @param req
   * @param res
   */
  customer(req, res) {
    const Customer = this.app.orm['Customer']
    const customerId = req.params.customer
    let userId = req.params.id
    if (!userId && req.user) {
      userId = req.user.id
    }
    if (!customerId || !userId || !req.user) {
      const err = new Error('A customer id and a customer in session are required')
      res.send(401, err)

    }
    // TODO, make this a strict relation
    Customer.findById(customerId)
      .then(customer => {
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
  customers(req, res) {
    const Customer = this.app.orm['Customer']
    let userId = req.params.id

    if (!userId && req.user) {
      userId = req.user.id
    }
    if (!userId && !req.user) {
      const err = new Error('A user id or a user in session are required')
      return res.send(401, err)
    }
    // console.log('IS BROKE', userId)

    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    // this.app.orm['User'].findById(userId)
    //   .then(user => {
    //     return user.getCustomers()
    //   })
    //   .then(customers => {
    //     return res.json(customers)
    //   })
    Customer.findAndCount({
      // TODO fix for sqlite
      // order: sort,
      where: {
        '$users.id$': userId
      },
      include: [{
        model: this.app.orm['User'],
        as: 'users',
        attributes: ['id']
      }],
      offset: offset
      // TODO sequelize breaks if limit is set here
      // limit: limit
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
  reviews(req, res) {

  }
}

