'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
// const Errors = require('proxy-engine-errors')

/**
 * @module ShopController
 * @description Shop Controller.
 */
module.exports = class ShopController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  /**
   * count the amount of shops
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Shop')
      .then(count => {
        const counts = {
          shops: count
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
  findAll(req, res){
    const orm = this.app.orm
    const Shop = orm['Shop']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Shop.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit,
      req: req
    })
      .then(shops => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, shops.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, shops.rows)
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
  create(req, res){
    const ShopService = this.app.services.ShopService
    lib.Validator.validateShop.create(req.body)
      .then(values => {
        return ShopService.create(req.body)
      })
      .then(shop => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, shop)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

