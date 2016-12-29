'use strict'

const Controller = require('trails/controller')

/**
 * @module CustomerController
 * @description Customer Controller.
 */
module.exports = class CustomerController extends Controller {
  /**
   *
   * @param req
   * @param res
   */
  create(req, res) {
    const CustomerService = this.app.services.CustomerService
    CustomerService.create(req.body)
      .then(customer => {
        return res.json(customer)
      })
      .catch(err => {
        // console.log('CustomerController.create', err)
        return res.serverError(err)
      })

  }
}

