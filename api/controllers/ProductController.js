/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')
/**
 * @module ProductController
 * @description Product Controller.
 */
module.exports = class ProductController extends Controller {
  findOne(req, res){
    const FootprintService = this.app.services.FootprintService
    FootprintService.find('Product', req.params.id, { where: {published: true}, populate: 'all' })
      .then(product => {
        if (!product) {
          console.log(Errors.FoundError)
          throw new Errors.FoundError(Error(`Product id ${req.params.id} not found`))
        }
        // console.log('ProductController.findOne', product.dataValues)
        return res.json(product)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  find(req, res){}
  count(req, res){
    const ProxyCartService = this.app.services.ProxyCartService
    let productCount = 0
    let variantCount = 0
    let imageCount = 0
    ProxyCartService.count('Product')
      .then(count => {
        productCount = count
        return ProxyCartService.count('ProductVariant')
      })
      .then(count => {
        variantCount = count
        return ProxyCartService.count('ProductImage')
      })
      .then(count => {
        imageCount = count
        const counts = {
          products: productCount,
          variants: variantCount,
          images: imageCount
        }
        return res.json(counts)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
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
  removeVariant(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeVariant(req.params.id)
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeVariant', err)
        return res.serverError(err)
      })
  }
  removeImage(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeImage(req.params.id)
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeVariant', err)
        return res.serverError(err)
      })
  }
  /**
   * upload CSV
   * @param req
   * @param res
   */
  // TODO
  uploadCSV(req, res) {
    const ProxyCartService = this.app.services.ProxyCartService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    ProxyCartService.csv(csv.path)
      .then(result => {
        return res.json({
          file: req.file
        })
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

