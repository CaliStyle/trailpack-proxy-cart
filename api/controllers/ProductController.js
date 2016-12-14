/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')

/**
 * @module ProductController
 * @description Product Controller.
 */
module.exports = class ProductController extends Controller {
  /**
   * Add Products
   * @param req
   * @param res
   */
  addProducts(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateAddProducts(req.body)
      .then(values => {
        return ProductService.addProducts(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.addProducts', err)
        return res.serverError(err)
      })
  }
  /**
   * Update Products
   * @param req
   * @param res
   */
  updateProducts(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateUpdateProducts(req.body)
      .then(values => {
        return ProductService.updateProducts(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.updateProducts', err)
        return res.serverError(err)
      })
  }
  /**
   * Remove Products
   * @param req
   * @param res
   */
  removeProducts(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateRemoveProducts(req.body)
      .then(values => {
        return ProductService.removeProducts(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeProducts', err)
        return res.serverError(err)
      })
  }
}

