'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')

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
    lib.Validator.validateCustomer(req.body)
      .then(values => {
        return CustomerService.create(req.body)
      })
      .then(customer => {
        return res.json(customer)
      })
      .catch(err => {
        // console.log('CustomerController.create', err)
        return res.serverError(err)
      })

  }
}

