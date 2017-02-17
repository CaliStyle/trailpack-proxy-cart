'use strict'

const Controller = require('trails/controller')

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
}

