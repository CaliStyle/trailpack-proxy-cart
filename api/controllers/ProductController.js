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
  /**
   *
   * @param req
   * @param res
   */
  // TODO add Customer Attributes to Product (Previously Purchased, Selected Options, attributes, discounts, etc)
  findById(req, res){
    const Product = this.app.orm['Product']
    Product.findIdDefault(req.params.id, {})
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error(`Product id ${ req.params.id } not found`))
        }
        return res.json(product)
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
  findByHandle(req, res){
    const Product = this.app.orm['Product']
    // console.log('ProductController.findByHandle', req.params.handle)
    Product.findByHandle(req.params.handle)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error(`Product handle ${ req.params.handle } not found`))
        }
        return res.json(product)
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
  search(req, res) {
    const orm = this.app.orm
    const Product = orm['Product']
    // const Collection = orm['Collection']
    // const Tag = orm['Tag']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'title DESC'
    const term = req.query.term
    // console.log('ProductController.search', term)
    Product.findAndCountDefault({
      where: {
        $or: [
          {
            title: {
              $like: `%${term}%`
            }
          },
          {
            '$tags.name$': {
              $like: `%${term}%`
            }
          },
          {
            '$collections.title$': {
              $like: `%${term}%`
            }
          }
        ]
      },
      order: sort,
      offset: offset
      // limit: limit // TODO: Sequelize breaks with limit here
    })
      .then(products => {
        res.set('X-Pagination-Total', products.count)
        res.set('X-Pagination-Pages', Math.ceil(products.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(products.rows)
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
  findOne(req, res){
    const orm = this.app.orm
    const Product = orm['Product']
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Product.findOneDefault({
      where: where
    })
      .then(product => {
        return res.json(product)
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
  findAll(req, res){
    const orm = this.app.orm
    const Product = orm['Product']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)
    Product.findAndCountDefault({
      where: where,
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(products => {
        res.set('X-Pagination-Total', products.count)
        res.set('X-Pagination-Pages', Math.ceil(products.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(products.rows)
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
  findByTag(req, res) {
    const orm = this.app.orm
    const Product = orm['Product']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    Product.findAndCountDefault({
      where: {
        '$tags.name$': req.params.tag
      },
      order: sort,
      offset: offset
      // limit: limit // TODO Sequelize breaks if a limit is here.
    })
      .then(products => {
        res.set('X-Pagination-Total', products.count)
        res.set('X-Pagination-Pages', Math.ceil(products.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(products.rows)
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
  findByCollection(req, res) {
    const orm = this.app.orm
    const Product = orm['Product']
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    Product.findAndCountDefault({
      where: {
        '$collections.handle$': req.params.handle
      },
      order: sort,
      offset: offset
      // limit: limit // TODO Sequelize breaks if a limit is here.
    })
      .then(products => {
        res.set('X-Pagination-Total', products.count)
        res.set('X-Pagination-Pages', Math.ceil(products.count / limit))
        res.set('X-Pagination-Page', offset == 0 ? 1 : Math.round(offset / limit))
        res.set('X-Pagination-Limit', limit)
        res.set('X-Pagination-Sort', sort)
        return res.json(products.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }



  /**
   * Count Products, Variants, Images
   * @param req
   * @param res
   */
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
    lib.Validator.validateProduct.add(req.body)
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
    lib.Validator.validateProduct.addProducts(req.body)
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
    lib.Validator.validateProduct.update(req.body)
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
    lib.Validator.validateProduct.updateProducts(req.body)
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
   * Remove Product
   * @param req
   * @param res
   */
  removeProduct(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateProduct.removeProduct(req.body)
      .then(values => {
        return ProductService.removeProduct(req.body)
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
  removeProducts(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateProduct.removeProducts(req.body)
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
    lib.Validator.validateVariant.removeVariants(req.body)
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
    lib.Validator.validateImage.removeImages(req.body)
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
   *
   * @param req
   * @param res
   */
  addTag(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.addTag(req.body.product, req.body.tag)
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.addTag', err)
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  removeTag(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeTag(req.body.product, req.body.tag)
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeTag', err)
        return res.serverError(err)
      })
  }
  /**
   * add a product to a collection
   * @param req
   * @param res
   */
  addCollection(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.addCollection(req.body.product, req.body.collection)
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.addCollection', err)
        return res.serverError(err)
      })
  }
  /**
   * remove a product from a collection
   * @param req
   * @param res
   */
  removeCollection(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeCollection(req.body.product, req.body.collection)
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.removeCollection', err)
        return res.serverError(err)
      })
  }

  /**
   * Add an association to a product
   * @param req
   * @param res
   */
  addAssociation(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.addAssociation(req.body.product, req.body.association)
      .then(data => {
        return res.json(data)
      })
      .catch(err => {
        // console.log('ProductController.addAssociation', err)
        return res.serverError(err)
      })
  }
  /**
   * Remove an association from a product
   * @param req
   * @param res
   */
  removeAssociation(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeAssociation(req.body.product, req.body.association)
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
      const err = new Error('File failed to upload, check input name is "csv" and try again.')
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
      const err = new Error('File failed to upload, check input name is "csv" and try again.')
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
  /**
   *
   * @param req
   * @param res
   */
  // TODO
  exportProducts(req, res) {
    //
  }
}

