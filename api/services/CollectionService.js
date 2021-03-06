/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
// const COLLECTION_DISCOUNT_TYPE = require('../../lib').Enums.COLLECTION_DISCOUNT_TYPE
// const COLLECTION_DISCOUNT_SCOPE = require('../../lib').Enums.COLLECTION_DISCOUNT_SCOPE

/**
 * @module CollectionService
 * @description Collection Service
 */
module.exports = class CollectionService extends Service {

  /**
   * Add a Collection
   * @param collection
   * @param options
   * @returns {Promise.<T>}
   */
  add(collection, options) {
    options = options || {}
    const Collection = this.app.orm.Collection

    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(resCollection => {
        if (!resCollection) {
          // Create a new Collection
          return this.create(collection, {transaction: options.transaction || null})
        }
        else {
          // Update the existing collection
          resCollection = _.merge(resCollection, collection)
          return this.update(resCollection, {transaction: options.transaction || null})
        }
      })
  }

  /**
   *
   * @param collection
   * @param options
   */
  create(collection, options) {
    options = options || {}
    const Collection =  this.app.orm['Collection']
    const Image =  this.app.orm['Image']
    const Discount = this.app.orm['Discount']
    const Tag = this.app.orm['Tag']
    let discounts = []

    let resCollection

    let create = _.omit(collection, [
      'collections',
      'images',
      'discounts',
      'discount_name',
      'discount_status',
      'discount_code',
      'discount_scope',
      'discount_type',
      'discount_product_exclude',
      'discount_product_include',
      'discount_rate',
      'discount_percentage',
      'tags'
    ])

    create = _.omitBy(create, _.isNil)

    if (collection.discount_type && collection.discount_type) {
      discounts.push({
        name: collection.discount_name || collection.title,
        code: collection.discount_code || collection.title,
        status: collection.discount_status,
        discount_scope: collection.discount_scope,
        discount_type: collection.discount_type,
        discount_product_exclude: collection.discount_product_exclude,
        discount_product_include: collection.discount_product_include,
        discount_rate: collection.discount_rate,
        discount_percentage: collection.discount_percentage
      })
    }
    if (collection.discounts && collection.discounts.length > 0) {
      discounts = [...discounts, ...collection.discounts]
    }

    return Collection.create(create, {transaction: options.transaction || null})
      .then(createdCollection => {
        if (!createdCollection) {
          throw new Error('Collection was not created')
        }
        resCollection = createdCollection

        if (collection.collections && collection.collections.length > 0) {
          // Resolve the collections
          collection.collections = _.sortedUniq(collection.collections.filter(n => n))
          return Collection.transformCollections(collection.collections, {transaction: options.transaction || null})
        }
        return []
      })
      .then(collections => {
        if (collections && collections.length > 0) {
          return resCollection.setCollections(collections.map( c => c.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(collections => {
        if (collection.images && collection.images.length > 0) {
          // Resolve the images
          collection.images = _.sortedUniq(collection.images.filter(n => n))
          return Image.transformImages(collection.images, {transaction: options.transaction || null})
        }
        return []
      })
      .then(images => {
        if (images && images.length > 0) {
          return Collection.sequelize.Promise.mapSeries(images, (image, index) => {
            return resCollection.addImage(image.id, {through: {position: index + 1 }, transaction: options.transaction || null})
          })
        }
        return
      })
      .then(() => {
        if (discounts.length > 0) {
          return Discount.transformDiscounts(discounts, {transaction: options.transaction || null})
        }
        return
      })
      .then(discounts => {
        if (discounts && discounts.length > 0) {
          return resCollection.setDiscounts(discounts.map(d => d.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(discounts => {
        if (collection.tags && collection.tags.length > 0) {
          collection.tags = _.sortedUniq(collection.tags.filter(n => n))
          return Tag.transformTags(collection.tags, {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        if (tags && tags.length > 0) {
          // Add Tags
          return resCollection.setTags(tags.map(tag => tag.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param collection
   * @param options
   */
  update(collection, options) {
    options = options || {}
    const Collection =  this.app.orm['Collection']
    const Image =  this.app.orm['Image']
    const Tag =  this.app.orm['Tag']

    if (!collection.id) {
      const err = new Errors.FoundError(Error('Collection is missing id'))
      return Promise.reject(err)
    }

    const update = _.omit(collection,['id','created_at','updated_at','collections','images','tags'])

    let resCollection
    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(_collection => {
        if (!_collection) {
          throw new Error('Collection could not be resolved')
        }
        resCollection = _collection
        return resCollection.update(update, {transaction: options.transaction || null})
      })
      .then(updatedCollection => {
        resCollection = updatedCollection
        if (collection.collections && collection.collections.length > 0) {
          // Resolve the collections
          collection.collections = _.sortedUniq(collection.collections.filter(n => n))
          return Collection.transformCollections(collection.collections, {transaction: options.transaction || null})
        }
        return
      })
      .then(collections => {
        if (collections && collections.length > 0) {
          return resCollection.setCollections(collections.map(c => c.id), {transaction: options.transaction || null})
        }
        return []
      })
      .then(collections => {
        if (collection.images && collection.images.length > 0) {
          // Resolve the images
          collection.images = _.sortedUniq(collection.images.filter(n => n))
          return Image.transformImages(collection.images, {transaction: options.transaction || null})
        }
        else {
          return []
        }
      })
      .then(images => {
        if (images && images.length > 0) {
          return Collection.sequelize.Promise.mapSeries(images, (image, index) => {
            return resCollection.addImage(image.id, {
              through: {position: index + 1},
              transaction: options.transaction || null
            })
          })
        }
        return
      })
      .then(images => {
        if (collection.tags && collection.tags.length > 0) {
          collection.tags = _.sortedUniq(collection.tags.filter(n => n))
          return Tag.transformTags(collection.tags, {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        if (tags && tags.length > 0) {
          // Add Tags
          return resCollection.setTags(tags.map(tag => tag.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(() => {
        return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
      })
  }

  /**
   * Add Multiple Collections
   * @param collection
   * @param collections
   * @param options
   * @returns {Promise.<*>}
   */
  addCollections(collection, collections, options) {
    options = options || {}
    if (!Array.isArray(collections)) {
      collections = [collections]
    }
    const Sequelize = this.app.orm['Collection'].sequelize
    // const addedProducts = []
    // Setup Transaction
    return Sequelize.transaction(t => {
      return Sequelize.Promise.mapSeries(collections, subCollection => {
        return this.addCollection(collection, subCollection, {
          transaction: t
        })
      })
    })
  }

  /**
   *
   * @param collection
   * @param subCollection
   * @param options
   * @returns {Promise.<T>}
   */
  addCollection(collection, subCollection, options){
    options = options || {}
    const Collection = this.app.orm['Collection']
    // const ItemCollection = this.app.orm['ItemCollection']
    let resCollection, resSubCollection
    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Collection.resolve(subCollection, {transaction: options.transaction || null})
      })
      .then(_subCollection => {
        if (!_subCollection) {
          throw new Errors.FoundError(Error('Sub Collection not found'))
        }
        resSubCollection = _subCollection
      //   return resCollection.hasCollection(resSubCollection.id, {transaction: options.transaction || null})
      // })
      // .then(hasCollection => {
        // if (!hasCollection) {
          // return ItemCollection.create({
          //   collection_id: resCollection.id,
          //   model_id: resSubCollection.id,
          //   model: 'collection'
          // }, {transaction: options.transaction || null})
        const through = subCollection.collection_position ? { position: subCollection.collection_position } : {}
        return resCollection.addCollection(resSubCollection.id, {
          through: through,
          hooks: false,
          individualHooks: false,
          returning: false,
          transaction: options.transaction || null
        })
        // }
        // return
      })
      .then(() => {
        return resSubCollection
        // return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param collection
   * @param subCollection
   * @param options
   * @returns {Promise.<T>}
   */
  removeCollection(collection, subCollection, options){
    options = options || {}
    const Collection = this.app.orm['Collection']
    let resCollection, resSubCollection
    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Collection.resolve(subCollection, {transaction: options.transaction || null})
      })
      .then(subCollection => {
        if (!subCollection) {
          throw new Errors.FoundError(Error('Sub Collection not found'))
        }
        resSubCollection = subCollection
        return resCollection.hasCollection(resSubCollection.id, {transaction: options.transaction || null})
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resCollection.removeCollection(resSubCollection.id, {transaction: options.transaction || null})
        }
        return resCollection
      })
      .then(collection => {
        return resSubCollection
        // return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
      })
  }

  /**
   * Add Multiple Products
   * @param collection
   * @param products
   * @param options
   * @returns {Promise.<*>}
   */
  addProducts(collection, products, options) {
    options = options || {}
    if (!Array.isArray(products)) {
      products = [products]
    }
    const Sequelize = this.app.orm['Collection'].sequelize
    // const addedProducts = []
    // Setup Transaction
    return Sequelize.transaction(t => {
      return Sequelize.Promise.mapSeries(products, product => {
        return this.addProduct(collection, product, {
          transaction: t
        })
      })
    })
  }
  /**
   *
   * @param collection
   * @param product
   * @param options
   * @returns {Promise.<T>}
   */
  addProduct(collection, product, options){
    options = options || {}
    const Collection = this.app.orm['Collection']
    const Product = this.app.orm['Product']
    let resCollection, resProduct
    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Product.resolve(product, {transaction: options.transaction || null})
      })
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return resCollection.hasProduct(resProduct.id, {transaction: options.transaction || null})
      })
      .then(hasCollection => {
        const through = product.product_position ? {position: product.product_position} : {}
        // if (!hasCollection) {
        return resCollection.addProduct(resProduct.id, {
          through: through,
          transaction: options.transaction || null
        })
        // }
        // else if (product.product_position) {
        //   return resCollection.updateProduct(resProduct.id, {
        //     through: through,
        //     transaction: options.transaction || null
        //   })
        // }
        // return resCollection
      })
      .then(collection => {
        return resProduct
      })
  }

  /**
   *
   * @param collection
   * @param product
   * @param options
   * @returns {Promise.<T>}
   */
  removeProduct(collection, product, options){
    options = options || {}
    const Collection = this.app.orm['Collection']
    const Product = this.app.orm['Product']
    let resCollection, resProduct
    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Product.resolve(product, {transaction: options.transaction || null})
      })
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return resCollection.hasProduct(resProduct.id, {transaction: options.transaction || null})
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resCollection.removeProduct(resProduct.id, {transaction: options.transaction || null})
        }
        return resCollection
      })
      .then(collection => {
        return resProduct
        // return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param collection
   * @param tag
   * @param options
   * @returns {Promise.<T>}
   */
  addTag(collection, tag, options){
    options = options || {}
    const Collection = this.app.orm['Collection']
    const Tag = this.app.orm['Tag']
    let resCollection, resTag
    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Tag.resolve(tag, {transaction: options.transaction || null})
      })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error('Tag not found'))
        }
        resTag = tag
        return resCollection.hasTag(resTag.id, {transaction: options.transaction || null})
      })
      .then(hasCollection => {
        if (!hasCollection) {
          return resCollection.addTag(resTag.id, {transaction: options.transaction || null})
        }
        return resCollection
      })
      .then(collection => {
        return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param collection
   * @param tag
   * @param options
   * @returns {Promise.<T>}
   */
  removeTag(collection, tag, options){
    options = options || {}
    const Collection = this.app.orm['Collection']
    const Tag = this.app.orm['Tag']
    let resCollection, resTag
    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Tag.resolve(tag, {transaction: options.transaction || null})
      })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error('Tag not found'))
        }
        resTag = tag
        return resCollection.hasTag(resTag.id, {transaction: options.transaction || null})
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resCollection.removeTag(resTag.id, {transaction: options.transaction || null})
        }
        return resCollection
      })
      .then(collection => {
        return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
      })
  }

  /**
   * Add Multiple Customers
   * @param collection
   * @param customers
   * @param options
   * @returns {Promise.<*>}
   */
  addCustomers(collection, customers, options) {
    options = options || {}
    if (!Array.isArray(customers)) {
      customers = [customers]
    }
    const Sequelize = this.app.orm['Collection'].sequelize
    // const addedProducts = []
    // Setup Transaction
    return Sequelize.transaction(t => {
      return Sequelize.Promise.mapSeries(customers, customer => {
        return this.addCustomer(collection, customer, {
          transaction: t
        })
      })
    })
  }

  /**
   *
   * @param collection
   * @param customer
   * @param options
   * @returns {Promise.<T>}
   */
  addCustomer(collection, customer, options){
    options = options || {}
    const Collection = this.app.orm['Collection']
    const Customer = this.app.orm['Customer']
    let resCollection, resCustomer
    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Customer.resolve(customer, {transaction: options.transaction || null, create: false})
      })
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return resCollection.hasCustomer(resCustomer.id, {transaction: options.transaction || null})
      })
      .then(hasCollection => {
        if (!hasCollection) {
          return resCollection.addCustomer(resCustomer.id, {transaction: options.transaction || null})
        }
        return resCollection
      })
      .then(collection => {
        return resCustomer
        // return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param collection
   * @param customer
   * @returns {Promise.<TResult>}
   */
  removeCustomer(collection, customer){
    const Collection = this.app.orm['Collection']
    const Customer = this.app.orm['Customer']
    let resCollection, resCustomer
    return Collection.resolve(collection)
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Customer.resolve(customer, {create: false})
      })
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return resCollection.hasCustomer(resCustomer.id)
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resCollection.removeCustomer(resCustomer.id)
        }
        return resCollection
      })
      .then(collection => {
        return resCustomer
        // return Collection.findByIdDefault(resCollection.id)
      })
  }
}

