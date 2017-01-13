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
  // TODO add Customer Attributes to Product (Previously Purchased, Selected Options, etc)
  findOne(req, res){
    // const FootprintService = this.app.services.FootprintService
    const Product = this.app.services.ProxyEngineService.getModel('Product')
    Product.findIdDefault(req.params.id, {})
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error(`Product id ${req.params.id} not found`))
        }
        // product.unwrapTags(product.tags)
        return res.json(product)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  findByTag(req, res) {
    const orm = this.app.services.ProxyEngineService.getModel
    const Product = orm('Product')
    const Collection = orm('Collection')
    const Tag = orm('Tag')
    Product.findAndCount({
      offset: req.query.offset || 0,
      limit: req.query.limit || 10,
      include: [
        {
          model: Tag,
          as: 'tags',
          where: {
            'name': req.params.tag
          }
        },
        {
          model: Collection,
          as: 'collections'
        }
      ]
    })
      .then(products => {
        // product.unwrapTags(product.tags)
        return res.json(products)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  findByCollection(req, res) {
    const orm = this.app.services.ProxyEngineService.getModel
    const Product = orm('Product')
    const Collection = orm('Collection')
    const Tag = orm('Tag')
    // console.log('PARAMS', req.params, 'Query', req.query)
    Product.findAndCount({
      offset: req.query.offset || 0,
      limit: req.query.limit || 10,
      include: [
        {
          model: Tag,
          as: 'tags'
        },
        {
          model: Collection,
          as: 'collections',
          where: {
            'handle': req.params.handle
          }
        }
      ]
    })
      .then(products => {
        return res.json(products)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  findAll(req, res){
    const orm = this.app.services.ProxyEngineService.getModel
    const Product = orm('Product')
    const Collection = orm('Collection')
    const Tag = orm('Tag')
    Product.findAndCount({
      offset: req.query.offset || 0,
      limit: req.query.limit || 10,
      include: [
        {
          model: Tag,
          as: 'tags'
        },
        {
          model: Collection,
          as: 'collections'
        }
      ]
    })
      .then(products => {
        // product.unwrapTags(product.tags)
        return res.json(products)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    let productCount = 0
    let variantCount = 0
    let imageCount = 0
    ProxyEngineService.count('Product')
      .then(count => {
        productCount = count
        return ProxyEngineService.count('ProductVariant')
      })
      .then(count => {
        variantCount = count
        return ProxyEngineService.count('ProductImage')
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
   *
   * @param req
   * @param res
   */
  addProduct(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateAddProduct(req.body)
      .then(values => {
        return ProductService.addProduct(req.body)
      })
      .then(product => {
        this.app.log.silly('ProductController.addProduct created:', product)
        return res.json(product)
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
   *
   * @param req
   * @param res
   */
  updateProduct(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateUpdateProduct(req.body)
      .then(values => {
        req.body.id = req.params.id
        return ProductService.updateProduct(req.body)
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
   *
   * @param req
   * @param res
   */
  removeVariants(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateRemoveVariants(req.body)
      .then(values => {
        return ProductService.removeVariants(req.body)
      })
      .then(products => {
        return res.json(products)
      })
      .catch(err => {
        // console.log('ProductController.removeVariant', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
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

  /**
   *
   * @param req
   * @param res
   */
  removeImages(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateRemoveImages(req.body)
      .then(values => {
        return ProductService.removeImages(req.body)
      })
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeVariant', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
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
  uploadCSV(req, res) {
    const ProductCsvService = this.app.services.ProductCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    ProductCsvService.productCsv(csv.path)
      .then(result => {
        return res.json({
          file: req.file,
          result: result
        })
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
  processUpload(req, res) {
    const ProductCsvService = this.app.services.ProductCsvService
    ProductCsvService.processProductUpload(req.params.id)
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   * upload uploadMetaCSV
   * @param req
   * @param res
   */
  uploadMetaCSV(req, res) {
    const ProductCsvService = this.app.services.ProductCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    ProductCsvService.productMetaCsv(csv.path)
      .then(result => {
        return res.json({
          file: req.file,
          result: result
        })
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
  processMetaUpload(req, res) {
    const ProductCsvService = this.app.services.ProductCsvService
    ProductCsvService.processProductMetaUpload(req.params.id)
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

