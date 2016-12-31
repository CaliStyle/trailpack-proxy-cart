'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')
/**
 * @module CustomerController
 * @description Customer Controller.
 */
module.exports = class CustomerController extends Controller {
  findOne(req, res){
    const Customer = this.app.services.ProxyEngineService.getModel('Customer')
    Customer.findIdDefault(req.params.id, {})
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error(`Customer id ${req.params.id} not found`))
        }
        return res.json(customer)
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
  update(req, res) {
    const CustomerService = this.app.services.CustomerService
    lib.Validator.validateCustomer(req.body)
      .then(values => {
        req.body.id = req.params.id
        return CustomerService.update(req.body)
      })
      .then(customer => {
        return res.json(customer)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }
}

