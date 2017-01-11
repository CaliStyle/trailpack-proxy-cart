'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
// const Errors = require('proxy-engine-errors')

/**
 * @module ShopController
 * @description Shop Controller.
 */
module.exports = class ShopController extends Controller {
  create(req, res){
    const ShopService = this.app.services.ShopService
    lib.Validator.validateShop(req.body)
      .then(values => {
        return ShopService.create(req.body)
      })
      .then(shop => {
        return res.json(shop)
      })
      .catch(err => {
        // console.log('ShopController.create', err)
        return res.serverError(err)
      })
  }
}

