'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')
// const lib = require('../../lib')
/**
 * @module TagController
 * @description Generated Trails.js Controller.
 */
module.exports = class TagController extends Controller {
  /**
   *
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Tag')
      .then(count => {
        const counts = {
          tags: count
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
    const Tag = orm['Tag']
    Tag.findByIdDefault(req.params.id, {})
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error(`Tag id ${ req.params.id } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tag)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  findByName(req, res){
    const orm = this.app.orm
    const Tag = orm['Tag']
    Tag.findOne({
      name: req.params.name
    })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error(`Tag name ${ req.params.name } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tag)
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
  findOne(req, res){
    const orm = this.app.orm
    const Tag = orm['Tag']
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Tag.findOne({
      where: where
    })
      .then(tag => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tag)
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
    const orm = this.app.orm
    const Tag = orm['Tag']
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)
    Tag.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(tags => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, tags.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tags.rows)
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
  search(req, res){
    const orm = this.app.orm
    const Tag = orm['Tag']
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || 'created_at DESC'
    const term = req.query.term
    Tag.findAndCount({
      where: {
        $or: [
          {
            name: {
              $iLike: `%${term}%`
            }
          }
        ]
      },
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(tags => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, tags.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tags.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

