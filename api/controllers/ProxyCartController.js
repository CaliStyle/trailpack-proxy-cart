'use strict'

const Controller = require('trails/controller')

/**
 * @module ProxyCartController
 * @description Generated Trails.js Controller.
 */
module.exports = class ProxyCartController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  countries(req, res) {
    const Country  = this.app.orm['Country']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Country.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit,
      req: req,
      include: [
        {
          model: this.app.orm['Province'],
          as: 'provinces'
        }
      ]
    })
      .then(countries => {
        // Paginate
        this.app.services.ProxyCartService.paginate(res, countries.count, limit, offset, sort)
        return res.json(countries.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  provinces(req, res) {
    const Province  = this.app.orm['Province']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Province.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit,
      req: req
    })
      .then(provinces => {
        // Paginate
        this.app.services.ProxyCartService.paginate(res, provinces.count, limit, offset, sort)
        return res.json(provinces.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

