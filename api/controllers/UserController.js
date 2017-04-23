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
        return res.json(customer)
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

    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'

    Customer.findAndCount({
      order: sort,
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
        res.set('X-Pagination-Total', customers.count)
        res.set('X-Pagination-Pages', Math.ceil(customers.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(customers.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

