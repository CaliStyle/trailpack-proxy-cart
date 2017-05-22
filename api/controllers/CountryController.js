'use strict'

const Controller = require('trails/controller')

/**
 * @module CountryController
 * @description Generated Trails.js Controller.
 */
module.exports = class CountryController extends Controller {
  /**
   *
   * @param req
   * @param rse
   */
  country(req, res) {

  }
  createCountry(req, res) {

  }
  updateCountry(req, res) {

  }
  destroyCountry(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
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

  /**
   *
   * @param req
   * @param res
   */
  province(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
  createProvince(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
  updateProvince(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
  destroyProvince(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
  addProvince(req, res) {
    const CountryService = this.app.services.CountryService
    CountryService.addProvince(req.params.id, req.params.province)
      .then(data => {
        return res.json(data)
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
  removeProvince(req, res) {
    const CountryService = this.app.services.CountryService
    CountryService.removeProvince(req.params.id, req.params.province)
      .then(data => {
        return res.json(data)
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

