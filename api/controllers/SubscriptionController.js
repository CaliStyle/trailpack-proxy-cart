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
    const SubscriptionService = this.app.services.SubscriptionService
    SubscriptionService.generalStats()
      .then(results => {
        res.json(results)
      })
      .catch(err => {
        return res.serverError(err)
      })
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
    const id = req.params.id

    Subscription.findByIdDefault(id, {})
      .then(subscription => {
        if (!subscription) {
          throw new Errors.FoundError(Error(`Subscription id ${id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
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
  findByToken(req, res){
    const orm = this.app.orm
    const Subscription = orm['Subscription']
    const token = req.params.token

    Subscription.findByTokenDefault(token, {})
      .then(subscription => {
        if (!subscription) {
          throw new Errors.FoundError(Error(`Subscription token ${token} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
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
  resolve(req, res){
    const orm = this.app.orm
    const Subscription = orm['Subscription']
    let id = req.params.id
    if (!id && req.subscription) {
      id = req.subscription.id
    }
    Subscription.resolve(id, {})
      .then(subscription => {
        if (!subscription) {
          throw new Errors.FoundError(Error(`Subscription id ${id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
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
    const Subscription = orm['Subscription']
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
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
        this.app.services.ProxyEngineService.paginate(res, subscriptions.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscriptions.rows)
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  activate(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const id = req.params.id

    lib.Validator.validateSubscription.activate(req.body)
      .then(values => {
        req.body.id = id
        return SubscriptionService.activate(req.body, id)
      })
      .then(subscription => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  deactivate(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const id = req.params.id

    lib.Validator.validateSubscription.deactivate(req.body)
      .then(values => {
        req.body.id = id
        return SubscriptionService.deactivate(req.body, id)
      })
      .then(subscription => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  renew(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const id = req.params.id

    SubscriptionService.renew(id)
      .then(subscription => {
        if (!subscription) {
          throw new Error('Unexpected Error while renewing subscription')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
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
        if (!subscription) {
          throw new Error('Unexpected Error while Cancelling Subscription')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
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
      .then(subscription => {
        // console.log('ProductController.addItemsToSubscription',data)
        if (!subscription) {
          throw new Error('Unexpected Error while adding items')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
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
      .then(subscription => {
        if (!subscription) {
          throw new Error('Unexpected Error while removing items')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
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

