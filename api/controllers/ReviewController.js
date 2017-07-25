'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')
const lib = require('../../lib')

/**
 * @module ReviewController
 * @description Generated Trails.js Controller.
 */
module.exports = class ReviewController extends Controller {
  generalStats(req, res) {
    return res.json({})
  }
  count(req, res) {
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Review')
      .then(count => {
        const counts = {
          reviews: count
        }
        return res.json(counts)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  findById(req, res) {
    const orm = this.app.orm
    const Review = orm['Review']
    const id = req.params.id

    Review.findById(id, {})
      .then(review => {
        if (!review) {
          throw new Errors.FoundError(Error(`Review id ${id} not found`))
        }
        return res.json(review)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  findAll(req, res) {
    const orm = this.app.orm
    const Review = orm['Review']
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Review.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(reviews => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, reviews.count, limit, offset, sort)
        return res.json(reviews.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  // TODO
  search(req, res) {

  }

  /**
   *
   * @param req
   * @param res
   */
  create(req, res) {
    const ReviewService = this.app.services.ReviewService
    lib.Validator.validateImage.create(req.body)
      .then(values => {
        return ReviewService.create(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ReviewController.removeVariant', err)
        return res.serverError(err)
      })
  }
  // TODO
  update(req, res) {
    const ReviewService = this.app.services.ReviewService
    lib.Validator.validateImage.update(req.body)
      .then(values => {
        return ReviewService.update(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ReviewController.removeVariant', err)
        return res.serverError(err)
      })
  }
  // TODO
  destroy(req, res) {
    const ReviewService = this.app.services.ReviewService
    lib.Validator.validateImage.destroy(req.body)
      .then(values => {
        return ReviewService.destroy(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ReviewController.removeVariant', err)
        return res.serverError(err)
      })
  }
}

