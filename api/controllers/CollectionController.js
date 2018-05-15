/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')
const lib = require('../../lib')
const _ = require('lodash')
/**
 * @module CollectionController
 * @description Generated Trails.js Controller.
 */
module.exports = class CollectionController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  /**
   *
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Collection')
      .then(count => {
        const counts = {
          collections: count
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
  findById(req, res){
    const orm = this.app.orm
    const Collection = orm['Collection']
    Collection.findByIdDefault(req.params.id, {})
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error(`Collection id ${ req.params.id } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  findByHandle(req, res){
    const orm = this.app.orm
    const Collection = orm['Collection']
    Collection.findByHandleDefault(req.params.handle)
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error(`Collection handle ${ req.params.handle } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
    const Collection = orm['Collection']
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Collection.findOneDefault({
      where: where
    })
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error(`Collection id ${ req.params.id } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
    const Collection = orm['Collection']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)
    Collection.findAndCountDefault({
      where: where,
      order: sort,
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
   *
   * @param req
   * @param res
   */
  search(req, res){
    const orm = this.app.orm
    const Collection = orm['Collection']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const term = req.query.term
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)
    const defaults = _.defaultsDeep(where, {
      $or: [
        {
          title: {
            $iLike: `%${term}%`
          }
        }
      ]
    })

    Collection.findAndCountDefault({
      where: defaults,
      order: sort,
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
   *
   * @param req
   * @param res
   */
  create(req, res) {
    const CollectionService = this.app.services.CollectionService
    lib.Validator.validateCollection.create(req.body)
      .then(values => {
        return CollectionService.create(req.body)
      })
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection Could was not Created'))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  update(req, res) {
    const CollectionService = this.app.services.CollectionService
    lib.Validator.validateCollection.update(req.body)
      .then(values => {
        req.body.id = req.params.id
        return CollectionService.update(req.body)
      })
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection was not updated'))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  addCollections(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.addCollections(req.params.id, req.body)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  addCollection(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.addCollection(req.params.id, req.params.collection)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  removeCollection(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.removeCollection(req.params.id, req.params.collection)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  collections(req, res) {
    const Collection = this.app.orm['Collection']
    const collectionId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!collectionId) {
      const err = new Error('A collection id is required')
      return res.send(401, err)
    }

    const ItemCollection = this.app.orm['ItemCollection']

    let count = 0

    ItemCollection.findAndCount({
      where: {
        collection_id: collectionId,
        model: 'collection'
      },
      attributes: ['model_id'],
      limit: limit,
      offset: offset
    })
      .then(arr => {
        count = arr.count
        const collectionIds = arr.rows.map(model => model.model_id)
        return Collection.findAll({
          where: {
            id: collectionIds
          }
        })
      })
      .then(collections => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collections)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })

    // Collection.findAndCount({
    //   order: sort,
    //   // where: {
    //   //   '$collections.id$': collectionId
    //   // },
    //   include: [
    //     {
    //       model: this.app.orm['Collection'],
    //       as: 'collections',
    //       where: {
    //         id: collectionId
    //       }
    //     }
    //   ],
    //   offset: offset,
    //   limit: limit
    // })
    //   .then(collections => {
    //     // Paginate
    //     this.app.services.ProxyEngineService.paginate(res, collections.count, limit, offset, sort)
    //     return this.app.services.ProxyPermissionsService.sanitizeResult(req, collections.rows)
    //   })
    //   .then(result => {
    //     return res.json(result)
    //   })
    //   .catch(err => {
    //     return res.serverError(err)
    //   })
  }

  /**
   *
   * @param req
   * @param res
   */
  addProducts(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.addProducts(req.params.id, req.body)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  addProduct(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.addProduct(req.params.id, req.params.product)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  removeProduct(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.removeProduct(req.params.id, req.params.product)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  products(req, res) {
    const Product = this.app.orm['Product']
    const collectionId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['title', 'ASC']]

    if (!collectionId) {
      const err = new Error('A collection id is required')
      return res.send(401, err)
    }

    // const Collection = this.app.orm['Collection']
    const ItemCollection = this.app.orm['ItemCollection']

    let count = 0

    ItemCollection.findAndCount({
      where: {
        collection_id: collectionId,
        model: 'product'
      },
      attributes: ['model_id'],
      limit: limit,
      offset: offset
    })
    .then(arr => {
      count = arr.count
      const productIds = arr.rows.map(model => model.model_id)
      return Product.findAllDefault({
        where: {
          id: productIds
        },
        req: req
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

    // Product.findAndCount({
    //   include: [
    //     {
    //       model: this.app.orm['Collection'],
    //       as: 'collections',
    //       required: true,
    //       where: {
    //         id: collectionId
    //       }
    //     }
    //   ],
    //   order: sort,
    //   offset: offset,
    //   limit: limit
    // })
    //   .then(products => {
    //     // Paginate
    //     this.app.services.ProxyEngineService.paginate(res, products.count, limit, offset, sort)
    //     return this.app.services.ProxyPermissionsService.sanitizeResult(req, products.rows)
    //   })
    //   .then(result => {
    //     return res.json(result)
    //   })
    //   .catch(err => {
    //     return res.serverError(err)
    //   })
  }

  /**
   *
   * @param req
   * @param res
   */
  addTag(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.addTag(req.params.id, req.params.tag)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  removeTag(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.removeTag(req.params.id, req.params.tag)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  tags(req, res) {
    const Tag = this.app.orm['Tag']
    const collectionId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!collectionId) {
      const err = new Error('A collection id is required')
      return res.send(401, err)
    }

    Tag.findAndCount({
      order: sort,
      include: [
        {
          model: this.app.orm['Collection'],
          as: 'collections',
          where: {
            id: collectionId
          }
        }
      ],
      offset: offset,
      limit: limit
    })
      .then(tags => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, tags.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tags.rows)
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
  addCustomers(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.addCustomers(req.params.id, req.body)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  addCustomer(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.addCustomer(req.params.id, req.params.customer)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  removeCustomer(req, res) {
    const CollectionService = this.app.services.CollectionService

    CollectionService.removeCustomer(req.params.id, req.params.customer)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
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
  customers(req, res) {
    const Customer = this.app.orm['Customer']
    const collectionId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!collectionId) {
      const err = new Error('A collection id is required')
      return res.send(401, err)
    }

    Customer.findAndCount({
      include: [
        {
          model: this.app.orm['Collection'],
          as: 'collections',
          where: {
            id: collectionId
          }
        }
      ],
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(customers => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, customers.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customers.rows)
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
  discounts(req, res) {
    const Discount = this.app.orm['Discount']
    const collectionId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!collectionId) {
      const err = new Error('A collection id is required')
      return res.send(401, err)
    }

    Discount.findAndCount({
      include: [
        {
          model: this.app.orm['Collection'],
          as: 'collections',
          where: {
            id: collectionId
          }
        }
      ],
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(discounts => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, discounts.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, discounts.rows)
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
    const CollectionCsvService = this.app.services.CollectionCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    CollectionCsvService.collectionCsv(csv.path)
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
    const CollectionCsvService = this.app.services.CollectionCsvService
    CollectionCsvService.processCollectionUpload(req.params.id)
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

