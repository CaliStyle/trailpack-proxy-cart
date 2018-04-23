'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
// const Errors = require('proxy-engine-errors')

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
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.createCountry(req.body)
      .then(values => {
        return CountryService.createCountry(req.body)
      })
      .then(country => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, country)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  updateCountry(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.updateCountry(req.body)
      .then(values => {
        return CountryService.updateCountry(req.body)
      })
      .then(country => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, country)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  destroyCountry(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.destroyCountry(req.body)
      .then(values => {
        return CountryService.destroyCountry(req.body)
      })
      .then(country => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, country)
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
  countries(req, res) {
    const Country  = this.app.orm['Country']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

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
        this.app.services.ProxyEngineService.paginate(res, countries.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, countries.rows)
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
  countryProvinces(req, res) {
    const countryId = this.req.params['id']
    const Province  = this.app.orm['Province']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!countryId) {
      const err = new Error('A country id is required')
      return res.send(401, err)
    }

    Province.findAndCount({
      where: {
        country_id: countryId
      },
      order: sort,
      offset: offset,
      limit: limit,
      req: req
    })
      .then(countries => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, countries.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, countries.rows)
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
  cities(req, res) {
    const City  = this.app.orm['City']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    City.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit,
      req: req
    })
      .then(cities => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, cities.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, cities.rows)
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
  city(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
  createCity(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.createCity(req.body)
      .then(values => {
        return CountryService.createCity(req.body)
      })
      .then(city => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, city)
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
  updateCity(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.updateCity(req.body)
      .then(values => {
        return CountryService.updateCity(req.body)
      })
      .then(city => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, city)
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
  destroyCity(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.destroyCity(req.body)
      .then(values => {
        return CountryService.destroyCity(req.body)
      })
      .then(city => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, city)
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
  county(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
  createCounty(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.createCounty(req.body)
      .then(values => {
        return CountryService.createCounty(req.body)
      })
      .then(county => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, county)
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
  updateCounty(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.updateCounty(req.body)
      .then(values => {
        return CountryService.updateCounty(req.body)
      })
      .then(county => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, county)
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
  destroyCounty(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.destroyCounty(req.body)
      .then(values => {
        return CountryService.destroyCounty(req.body)
      })
      .then(county => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, county)
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
  counties(req, res) {
    const County  = this.app.orm['County']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    County.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit,
      req: req
    })
      .then(counties => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, counties.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, counties.rows)
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
  province(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
  createProvince(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.createProvince(req.body)
      .then(values => {
        return CountryService.createProvince(req.body)
      })
      .then(province => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, province)
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
  updateProvince(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.updateProvince(req.body)
      .then(values => {
        return CountryService.updateProvince(req.body)
      })
      .then(province => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, province)
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
  destroyProvince(req, res) {
    const CountryService = this.app.services.CountryService
    lib.Validator.validateCountry.destroyProvince(req.body)
      .then(values => {
        return CountryService.destroyProvince(req.body)
      })
      .then(province => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, province)
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
  addProvince(req, res) {
    const CountryService = this.app.services.CountryService
    CountryService.addProvince(req.params.id, req.params.province)
      .then(province => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, province)
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
  removeProvince(req, res) {
    const CountryService = this.app.services.CountryService
    CountryService.removeProvince(req.params.id, req.params.province)
      .then(province => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, province)
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
  provinces(req, res) {
    const Province  = this.app.orm['Province']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Province.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit,
      req: req
    })
      .then(provinces => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, provinces.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, provinces.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

