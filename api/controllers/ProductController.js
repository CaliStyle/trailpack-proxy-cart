/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
/**
 * @module ProductController
 * @description Product Controller.
 */
module.exports = class ProductController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  /**
   *
   * @param req
   * @param res
   */
  // TODO add Customer Attributes to Product (Previously Purchased, Selected Options, attributes, discounts, etc)
  findById(req, res){
    const Product = this.app.orm['Product']
    Product.findByIdDefault(req.params.id, {req: req})
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error(`Product id ${ req.params.id } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  findByHandle(req, res){
    const Product = this.app.orm['Product']
    Product.findByHandleDefault(req.params.handle, {req: req})
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error(`Product handle ${ req.params.handle } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  resolve(req, res){
    const Product = this.app.orm['Product']
    Product.resolve(req.params.id, {req: req})
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error(`Product ${ req.params.id } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  search(req, res) {
    const orm = this.app.orm
    const Product = orm['Product']
    // const Collection = orm['Collection']
    // const Tag = orm['Tag']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['title', 'DESC']]
    const term = req.query.term
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)
    const defaults = _.defaultsDeep(where, {
      $or: [
        {
          title: {
            $iLike: `%${term}%`
          }
        },
        {
          type: {
            $iLike: `%${term}%`
          }
        }
        // {
        //   '$tags.name$': {
        //     $iLike: `%${term}%`
        //   }
        // },
        // {
        //   '$collections.title$': {
        //     $iLike: `%${term}%`
        //   }
        // }
      ]
    })
    Product.findAndCountDefault({
      where: defaults,
      order: sort,
      offset: offset,
      req: req,
      limit: limit
    })
      .then(products => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, products.count, limit, offset, sort)

        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products.rows)
      })
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
  findOne(req, res){
    const orm = this.app.orm
    const Product = orm['Product']
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Product.findOneDefault({
      where: where,
      req: req
    })
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  findAll(req, res){
    const orm = this.app.orm
    const Product = orm['Product']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Product.findAndCountDefault({
      where: where,
      order: sort,
      offset: offset,
      limit: limit,
      req: req
    })
      .then(products => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, products.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products.rows)
      })
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
  // TODO make this work pas the Cartesian Product Sequelize Bug
  findByTag(req, res) {
    const orm = this.app.orm
    const Product = orm['Product']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]
    // Product.findAndCountDefault({
    //   include: [
    //     {
    //       model: this.app.orm['Tag'],
    //       as: 'tags',
    //       where: {
    //         name: req.params.tag
    //       }
    //     }
    //   ],
    //   order: sort,
    //   offset: offset,
    //   req: req,
    //   limit: limit
    // })
    const Tag = this.app.orm['Tag']
    const ItemTag = this.app.orm['ItemTag']
    let tagId, count = 0
    Tag.findOne({
      where: {
        name: req.params.tag
      },
      attributes: ['id']
    })
      .then(tag => {
        if (!tag) {
          throw new Error(`Tag ${req.params.tag} not found`)
        }
        tagId = tag.id

        return ItemTag.findAndCount({
          where: {
            tag_id: tagId,
            model: 'product'
          },
          attributes: ['model_id'],
          limit: limit,
          offset: offset
        })
      })
      .then(arr => {
        count = arr.count
        const productIds = arr.rows.map(model => model.model_id)
        return Product.findAllDefault({
          where: {
            id: productIds
          }
        })
      })
      .then(products => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products)
      })
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
  // TODO, make this work past the Cartesian Product
  findByCollection(req, res) {
    const Product = this.app.orm['Product']

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['position', 'ASC']]
    // const query = {
    //   distinct: true,
    //   // subQuery: false,
    //   include: [
    //     {
    //       model: this.app.orm['Collection'],
    //       as: 'collections',
    //       where: {
    //         handle: req.params.handle
    //       }
    //     },
    //     {
    //       model: this.app.orm['ProductImage'],
    //       as: 'images',
    //       order: ['position', 'ASC']
    //     },
    //     {
    //       model: this.app.orm['Tag'],
    //       as: 'tags',
    //       attributes: ['name', 'id'],
    //       order: ['name', 'ASC']
    //     },
    //     {
    //       model: this.app.orm['Vendor'],
    //       as: 'vendors',
    //       attributes: [
    //         'id',
    //         'handle',
    //         'name'
    //       ]
    //     }
    //   ],
    //   offset: offset,
    //   limit: limit,
    //   order: sort,
    //   req: req
    // }
    // Product.count({
    //   distinct: true,
    //   include: [
    //     {
    //       model: this.app.orm['Collection'],
    //       as: 'collections',
    //       where: {
    //         handle: req.params.handle
    //       }
    //     }
    //   ]
    // })
    //   .then(c => {
    //     count = c
    //     return Product.findAll(query)
    //   })
    const Collection = this.app.orm['Collection']
    const ItemCollection = this.app.orm['ItemCollection']
    let collectionId, count = 0, models = []
    Collection.findOne({
      where: {
        handle: req.params.handle
      },
      attributes: ['id']
    })
      .then(collection => {
        if (!collection) {
          throw new Error(`Collection ${req.params.handle} not found`)
        }
        collectionId = collection.id

        return ItemCollection.findAndCount({
          where: {
            collection_id: collectionId,
            model: 'product'
          },
          attributes: ['model_id','position'],
          order: sort,
          limit: limit,
          offset: offset
        })
      })
      .then(arr => {
        count = arr.count
        models = _.orderBy(arr.rows, ['position'], ['asc'])
        const productIds = models.map(model => model.model_id)
        return Product.findAllDefault({
          where: {
            id: productIds
          },
          req: req
        })
      })
      .then(products => {
        products = products.map(product => {
          return _.extend(product, {position: models.find(m => m.model_id === product.id).position})
        })
        products = _.orderBy(products, ['position'], ['asc'])
        // console.log('working on models', products)
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products)
      })
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
  searchByCollection(req, res) {
    const Product = this.app.orm['Product']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const term = req.query.term
    const query = {
      distinct: true,
      where: {
        $or: [
          {
            title: {
              $iLike: `%${term}%`
            }
          },
          {
            type: {
              $iLike: `%${term}%`
            }
          }
        ]
      },
      include: [
        {
          model: this.app.orm['Collection'],
          as: 'collections',
          where: {
            handle: req.params.handle
          }
        },
        {
          model: this.app.orm['ProductImage'],
          as: 'images',
          order: [['position', 'ASC']]
        },
        {
          model: this.app.orm['Tag'],
          as: 'tags',
          attributes: ['name', 'id'],
          order: [['name', 'ASC']]
        },
        {
          model: this.app.orm['Vendor'],
          as: 'vendors',
          attributes: [
            'id',
            'handle',
            'name'
          ]
        }
      ],
      order: sort,
      offset: offset,
      req: req,
      limit: limit
    }

    Product.findAndCount(query)
      .then(products => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, products.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products.rows)
      })
      .then(result => {
        return res.json(result)
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products)
      })
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
  updateProduct(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateProduct.update(req.body)
      .then(values => {
        req.body.id = req.params.id
        return ProductService.updateProduct(req.body)
      })
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
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
    lib.Validator.validateProduct.updateProducts(req.body)
      .then(values => {
        return ProductService.updateProducts(req.body)
      })
      .then(products => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
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
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
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
      .then(products => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products)
      })
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
  removeVariants(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateVariant.removeVariants(req.body)
      .then(values => {
        return ProductService.removeVariants(req.body)
      })
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  removeVariant(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeVariant(req.params.variant)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  createVariant(req, res) {
    const ProductService = this.app.services.ProductService
    lib.Validator.validateVariant.create(req.body)
      .then(values => {
        return ProductService.createVariant(req.params.id, req.body)
      })
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  updateVariant(req, res) {
    const ProductService = this.app.services.ProductService
    if (!req.body) {
      req.body = {}
    }
    if (!req.body.id) {
      req.body.id = req.params.variant
    }

    lib.Validator.validateVariant.update(req.body)
      .then(values => {
        return ProductService.updateVariant(req.params.id, req.body)
      })
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  createImage(req, res){
    const ProductService = this.app.services.ProductService
    const image = req.file
    const product = req.params.id
    const variant = req.params.variant

    if (!image) {
      const err = new Error('Image File failed to upload, check input type is file and try again.')
      return res.serverError(err)
    }

    ProductService.createImage(product, variant, image.path, req.body)
      .then(image => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, image)
      })
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
  addImage(req, res){
    const ProductService = this.app.services.ProductService
    const image = req.file
    const product = req.params.id
    const variant = req.params.variant

    if (!image) {
      const err = new Error('Image File failed to upload, check input type is file and try again.')
      return res.serverError(err)
    }

    // this.app.log.debug(image)
    ProductService.addImage(product, variant, image.path, req.body)
      .then(image => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, image)
      })
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
  removeImages(req, res){
    const ProductService = this.app.services.ProductService
    lib.Validator.validateImage.removeImages(req.body)
      .then(values => {
        return ProductService.removeImages(req.body)
      })
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  removeImage(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeImage(req.params.image)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  addTag(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.addTag(req.params.id, req.params.tag)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  removeTag(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeTag(req.params.id, req.params.tag)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
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

    const collection = req.body || {}
    if (_.isString(req.params.collection)) {
      collection.handle = req.params.collection
    }
    else {
      collection.id = req.params.collection
    }

    ProductService.addCollection(req.params.id, collection)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   * add a product to a collection
   * @param req
   * @param res
   */
  addCollections(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.addCollections(req.params.id, req.body)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
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
    ProductService.removeCollection(req.params.id, req.params.collection)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  collections(req, res) {
    const Collection = this.app.orm['Collection']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!productId) {
      const err = new Error('A collection id is required')
      return res.send(401, err)
    }

    Collection.findAndCountDefault({
      order: sort,
      include: [
        {
          model: this.app.orm['Product'],
          as: 'products',
          where: {
            id: productId
          }
        }
      ],
      offset: offset,
      limit: limit
    })
      .then(collections => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, collections.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collections.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
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
    ProductService.addAssociation(req.params.id, req.params.association)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
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
    ProductService.removeAssociation(req.params.id, req.params.association)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  // TODO, do this the actual way.
  associations(req, res) {
    const Product = this.app.orm['Product']
    const ProductAssociation = this.app.orm['ProductAssociation']
    const ProductVariant = this.app.orm['ProductVariant']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['position','ASC']]

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }
    let resAssociations
    Product.resolve(productId, { attributes: ['id'] })
      .then(product => {
        return ProductAssociation.findAndCount({
          where: {
            product_id: product.id,
          },
          limit: limit,
          offset: offset,
          order: sort
        })
      })
      .then(associations => {
        resAssociations = associations
        return ProductVariant.findAll({
          where: {
            id: resAssociations.rows.map(a => a.associated_variant_id).filter(v => v)
          }
        })
      })
      .then(associations => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, resAssociations.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, associations)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }


  /**
   * Add an association to a product
   * @param req
   * @param res
   */
  addVariantAssociation(req, res){
    const variant = req.params.variant ? {
      product_id: req.params.id,
      id: req.params.variant
    } : req.params.id

    const ProductService = this.app.services.ProductService
    ProductService.addVariantAssociation(variant, req.params.association)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   * Remove an association from a product
   * @param req
   * @param res
   */
  removeVariantAssociation(req, res){
    const variant = req.params.variant ? {
      product_id: req.params.id,
      id: req.params.variant
    } : req.params.id

    const ProductService = this.app.services.ProductService
    ProductService.removeVariantAssociation(variant, req.params.association)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  // TODO, do this the actual way.
  variantAssociations(req, res) {
    const ProductVariant = this.app.orm['ProductVariant']
    const ProductAssociation = this.app.orm['ProductAssociation']
    const variantId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['position','ASC']]

    if (!variantId) {
      const err = new Error('A product variant id is required')
      return res.send(401, err)
    }
    let resAssociations
    ProductVariant.resolve(variantId, {
      attributes: ['id']
    })
      .then(productVariant => {
        return ProductAssociation.findAndCount({
          where: {
            variant_id: productVariant.id,
          },
          limit: limit,
          offset: offset,
          order: sort
        })
      })
      .then(associations => {
        resAssociations = associations
        return ProductVariant.findAll({
          where: {
            id: resAssociations.rows.map(a => a.associated_variant_id).filter(v => v)
          }
        })
      })
      .then(associations => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, resAssociations.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, associations)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Add an shop to a product
   * @param req
   * @param res
   */
  addShop(req, res) {
    const ProductService = this.app.services.ProductService
    ProductService.addShop(req.params.id, req.params.shop)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   * Remove an shop from a product
   * @param req
   * @param res
   */
  removeShop(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeShop(req.params.id, req.params.shop)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  shops(req, res) {
    const Shop = this.app.orm['Shop']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }

    Shop.findAndCount({
      order: sort,
      where: {
        '$products.id$': productId
      },
      offset: offset,
      limit: limit,
      include: [
        {
          model: this.app.orm['Product'],
          as: 'products',
          attributes: ['id'],
          duplicating: false
        }
      ]
    })
      .then(shops => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, shops.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, shops.rows)
      })
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
  // TODO, do this the actual way.
  relations(req, res) {
    const Product = this.app.orm['Product']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }
    Product.findById(productId, {
      attributes: ['id']
    })
      .then(product => {
        return product.getRelations({
          limit: limit,
          offset: offset,
          order: sort
        })
      })
      .then(associations => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, associations.length, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, associations)
      })
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
  // TODO, find some suggestions.
  suggestions(req, res) {
    const Product = this.app.orm['Product']
    const productId = req.params.id
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }
    Product.findById(productId, {
      attributes: ['id']
    })
      .then(product => {
        return product.getRelations({
          limit: limit,
          offset: offset,
          order: sort
        })
      })
      .then(associations => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, associations.length, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, associations)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Add an vendor to a product
   * @param req
   * @param res
   */
  addVendor(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.addVendor(req.params.id, req.params.vendor)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   * Remove an vendor from a product
   * @param req
   * @param res
   */
  removeVendor(req, res){
    const ProductService = this.app.services.ProductService
    ProductService.removeVendor(req.params.id, req.params.vendor)
      .then(product => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, product)
      })
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
  vendors(req, res) {
    const Vendor = this.app.orm['Vendor']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }

    Vendor.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      include: [
        {
          model: this.app.orm['Product'],
          as: 'products',
          attributes: ['id'],
          where: {
            id: productId
          }
        }
      ]
    })
      .then(vendors => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, vendors.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, vendors.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * upload CSV
   * @param req
   * @param res
   */
  uploadCSV(req, res) {
    // No Timeout
    req.setTimeout(0)

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
    // No Timeout
    req.setTimeout(0)

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
    // No Timeout
    req.setTimeout(0)

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
    // No Timeout
    req.setTimeout(0)

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
   * upload uploadReviewCSV
   * @param req
   * @param res
   */
  uploadReviewCSV(req, res) {
    const ProductCsvService = this.app.services.ProductCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload, check input name is "csv" and try again.')
      return res.serverError(err)
    }

    ProductCsvService.productReviewCsv(csv.path)
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
  processReviewUpload(req, res) {
    const ProductCsvService = this.app.services.ProductCsvService
    ProductCsvService.processProductReviewUpload(req.params.id)
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

  /**
   *
   * @param req
   * @param res
   */
  reviews(req, res) {
    const Review = this.app.orm['ProductReview']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }

    Review.findAndCount({
      order: sort,
      where: {
        product_id: productId
      },
      offset: offset,
      limit: limit
    })
      .then(reviews => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, reviews.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, reviews.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  variants(req, res) {
    const Variant = this.app.orm['ProductVariant']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }

    Variant.findAndCount({
      order: sort,
      where: {
        product_id: productId
      },
      offset: offset,
      limit: limit
    })
      .then(variants => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, variants.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, variants.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  variantsSearch(req, res) {
    const Variant = this.app.orm['ProductVariant']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['sku', 'DESC']]
    const term = req.query.term
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }

    const defaults = _.defaultsDeep(where, {
      product_id: productId,
      $or: [
        {
          title: {
            $iLike: `%${term}%`
          }
        },
        {
          sku: {
            $iLike: `%${term}%`
          }
        }
        // {
        //   '$tags.name$': {
        //     $iLike: `%${term}%`
        //   }
        // },
        // {
        //   '$collections.title$': {
        //     $iLike: `%${term}%`
        //   }
        // }
      ]
    })

    Variant.findAndCount({
      order: sort,
      where: defaults,
      offset: offset,
      limit: limit
    })
      .then(variants => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, variants.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, variants.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  images(req, res) {
    const Image = this.app.orm['ProductImage']
    const productId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at','DESC']]

    if (!productId) {
      const err = new Error('A product id is required')
      return res.send(401, err)
    }

    Image.findAndCount({
      order: sort,
      where: {
        product_id: productId
      },
      offset: offset,
      limit: limit
    })
      .then(images => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, images.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, images.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

