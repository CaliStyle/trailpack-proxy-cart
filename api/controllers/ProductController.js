/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')

/**
 * @module ProductController
 * @description Product Controller.
 */
module.exports = class ProductController extends Controller {
  findOne(req, res){
    const FootprintService = this.app.services.FootprintService
    FootprintService.find('Product', req.params.id, { populate: 'all' })
      .then(product => {
        // console.log('ProductController.findOne', product.dataValues)
        return res.json(product)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  find(req, res){}
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
      .then(products => {
        this.app.log.silly('ProductController.addProducts created:', products)
        return res.json(products)
      })
      .catch(err => {
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
  /**
   * Remove Products
   * @param req
   * @param res
   */
  uploadCSV(req, res) {
    // const ProxyCartService = this.app.services.ProxyCartService
  }
}

