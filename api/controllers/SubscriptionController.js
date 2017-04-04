'use strict'

const Controller = require('trails/controller')
// const Errors = require('proxy-engine-errors')
const lib = require('../../lib')

/**
 * @module SubscriptionController
 * @description Subscription Controller
 */
module.exports = class SubscriptionController extends Controller {
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
}

