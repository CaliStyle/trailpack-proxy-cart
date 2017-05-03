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
        return res.json(tag)
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
        return res.json(tag)
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
        return res.json(tag)
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
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)
    Tag.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(tags => {
        res.set('X-Pagination-Total', tags.count)
        res.set('X-Pagination-Pages', Math.ceil(tags.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Offset', offset)
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(tags.rows)
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
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const term = req.query.term
    Tag.findAndCount({
      where: {
        $or: [
          {
            title: {
              $like: `%${term}%`
            }
          }
        ]
      },
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(tags => {
        res.set('X-Pagination-Total', tags.count)
        res.set('X-Pagination-Pages', Math.ceil(tags.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Offset', offset)
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(tags.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

