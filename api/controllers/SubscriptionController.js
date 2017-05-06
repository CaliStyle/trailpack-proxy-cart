'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')
const lib = require('../../lib')

/**
 * @module SubscriptionController
 * @description Subscription Controller
 */
module.exports = class SubscriptionController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  /**
   * count the amount of subscriptions
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Subscription')
      .then(count => {
        const counts = {
          subscriptions: count
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
    const Subscription = orm['Subscription']
    let id = req.params.id
    if (!id && req.subscription) {
      id = req.subscription.id
    }
    Subscription.findByIdDefault(id, {})
      .then(subscription => {
        if (!subscription) {
          throw new Errors.FoundError(Error(`Subscription id ${id} not found`))
        }
        return res.json(subscription)
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
    const Subscription = orm['Subscription']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Subscription.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(subscriptions => {
        // Paginate
        this.app.services.ProxyCartService.paginate(res, subscriptions.count, limit, offset, sort)
        return res.json(subscriptions.rows)
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
    const SubscriptionService = this.app.services.SubscriptionService
    let id = req.params.id
    if (!id && req.subscription) {
      id = req.subscription.id
    }
    if (!req.body) {
      req.body = {}
    }
    if (!req.body.id) {
      req.body.id = id
    }
    lib.Validator.validateSubscription.update(req.body)
      .then(values => {
        return SubscriptionService.update(req.body)
      })
      .then(subscription => {
        return res.json(subscription)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  activate(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    let id = req.params.id
    if (!id && req.subscription) {
      id = req.subscription.id
    }
    lib.Validator.validateSubscription.activate(req.body)
      .then(values => {
        req.body.id = id
        return SubscriptionService.activate(req.body, id)
      })
      .then(subscription => {
        return res.json(subscription)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  deactivate(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    let id = req.params.id
    if (!id && req.subscription) {
      id = req.subscription.id
    }
    lib.Validator.validateSubscription.deactivate(req.body)
      .then(values => {
        req.body.id = id
        return SubscriptionService.deactivate(req.body, id)
      })
      .then(subscription => {
        return res.json(subscription)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  cancel(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    let id = req.params.id
    if (!id && req.subscription) {
      id = req.subscription.id
    }
    lib.Validator.validateSubscription.cancel(req.body)
      .then(values => {
        req.body.id = id
        return SubscriptionService.cancel(req.body, id)
      })
      .then(subscription => {
        return res.json(subscription)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addItems(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const id = req.params.id
    lib.Validator.validateSubscription.addItems(req.body)
      .then(values => {
        return SubscriptionService.addItems(req.body, id)
      })
      .then(data => {
        // console.log('ProductController.addItemsToSubscription',data)
        if (!data) {
          throw new Error('Unexpected Error while adding items')
        }
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.addItemsToSubscription', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  removeItems(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    let id = req.params.id
    if (!id && req.subscription) {
      id = req.subscription.id
    }
    lib.Validator.validateSubscription.removeItems(req.body)
      .then(values => {
        return SubscriptionService.removeItems(req.body, id)
      })
      .then(data => {
        if (!data) {
          throw new Error('Unexpected Error while removing items')
        }
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeItemsFromSubscription', err)
        return res.serverError(err)
      })
  }

  /**
   * upload CSV
   * @param req
   * @param res
   */
  uploadCSV(req, res) {
    const SubscriptionCsvService = this.app.services.SubscriptionCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    SubscriptionCsvService.subscriptionCsv(csv.path)
      .then(result => {
        return res.json({
          file: req.file,
          result: result
        })
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
  processUpload(req, res) {
    const SubscriptionCsvService = this.app.services.SubscriptionCsvService
    SubscriptionCsvService.processSubscriptionUpload(req.params.id)
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
  exportSubscriptions(req, res) {
    //
  }
}

