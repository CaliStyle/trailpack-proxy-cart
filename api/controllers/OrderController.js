'use strict'

const Controller = require('trails/controller')

/**
 * @module OrderController
 * @description Order Controller.
 */
module.exports = class OrderController extends Controller {
  /**
   * count the amount of carts
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Order')
      .then(count => {
        const counts = {
          orders: count
        }
        return res.json(counts)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

