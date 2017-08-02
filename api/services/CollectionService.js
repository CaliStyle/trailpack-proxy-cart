/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
// const COLLECTION_DISCOUNT_TYPE = require('../utils/enums').COLLECTION_DISCOUNT_TYPE
const COLLECTION_DISCOUNT_SCOPE = require('../utils/enums').COLLECTION_DISCOUNT_SCOPE

/**
 * @module CollectionService
 * @description Collection Service
 */
module.exports = class CollectionService extends Service {

  /**
   * Add a Collection
   * @param collection
   * @returns {Promise}
   */
  add(collection, options) {
    options = options || {}
    const Collection = this.app.orm.Collection

    return Collection.resolve(collection, {transaction: options.transaction || null})
      .then(resCollection => {
        if (!resCollection) {
          // Create a new Collection
          return this.create(collection, options)
        }
        else {
          // Set ID in case it's missing in this transaction
          collection.id = resCollection.id
          // Update the existing collection
          return this.update(collection, options)
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
    // options = _.defaultsDeep(options, {
    //   include: [
    //     {
    //       model: this.app.orm['Image'],
    //       as: 'images'
    //     }
    //   ]
    // })
    const Collection =  this.app.orm.Collection
    const Image =  this.app.orm.Image

    let resCollection
    const create = _.omit(collection, ['collections','images'])
    return Collection.create(create, options)
      .then(createdCollection => {
        resCollection = createdCollection

        if (collection.collections && collection.collections.length > 0) {
          // Resolve the collections
          collection.collections = _.sortedUniq(collection.collections.filter(n => n))
          // console.log('THIS COLLECTION COLLECTIONS NOW', collection.collections)
          return Collection.transformCollections(collection.collections, {transaction: options.transaction || null})
        }
        return []
      })
      .then(collections => {
        // console.log('THESE COLLECTIONS RESOLVED', collections)
        if (collections && collections.length > 0) {
          return resCollection.setCollections(collections.map( c => c.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(collections => {
        // console.log('added collections', collections)
        if (collection.images && collection.images.length > 0) {
          // Resolve the images
          collection.images = _.sortedUniq(collection.images.filter(n => n))
          return Image.transformImages(collection.images, {transaction: options.transaction || null})
        }
        return []
      })
      .then(images => {
        // console.log('THESE COLLECTIONS RESOLVED', collections)
        if (images && images.length > 0) {
          return Promise.all(images.map((image, index) => {
            return resCollection.addImage(image.id, {position: index + 1})
          }))
        }
        return
      })
      .then(() => {
        return Collection.findByIdDefault(resCollection.id, options)
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

    if (!collection.id) {
      const err = new Errors.FoundError(Error('Collection is missing id'))
      return Promise.reject(err)
    }
    let resCollection
    const update = _.omit(collection,['id','created_at','updated_at','collections','images'])
    return Collection.findByIdDefault(collection.id)
      .then(resCollection => {
        return resCollection.update(update, options)
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
        return []
      })
      .then(images => {
        // console.log('THESE COLLECTIONS RESOLVED', collections)
        if (images && images.length > 0) {
          return Promise.all(images.map((image, index) => {
            return resCollection.addImage(image.id, {position: index + 1, transaction: options.transaction || null})
          }))
        }
        return
      })
      .then(() => {
        return resCollection.reload({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param cart
   * @param options
   * @returns {*}
   */
  cartCollections(cart, options) {
    options = options || {}
    const Collection = this.app.orm['Collection']
    const ItemCollection = this.app.orm['ItemCollection']
    const criteria = []
    const productIds = []
    const customerIds = []

    if (cart.customer_id) {
      criteria.push({model: 'customer', model_id: cart.customer_id})
      customerIds.push(cart.customer_id)
    }

    cart.line_items.forEach(item => {
      criteria.push({model: 'product', model_id: item.product_id})
      productIds.push(item.product_id)
    })

    if (criteria.length == 0) {
      return Promise.resolve([])
    }
    // console.log('CRITERIA ONE', criteria)
    return ItemCollection.findAll({
      where: {
        $or: criteria
      },
      attributes: ['collection_id', 'model', 'model_id'],
      transaction: options.transaction || null
    })
      .then(itemCollections => {
        // console.log('cart checkout', itemCollections)
        // console.log('CRITERIA FOUND',itemCollections)
        const itemCriteria = []

        itemCollections.forEach(item => {
          // console.log('FOUND COLLECTION', item.get({plain: true}))
          if (itemCriteria.indexOf(item.collection_id) == -1) {
            itemCriteria.push(item.collection_id)
          }
        })

        // console.log('CRITERIA TWO', itemCriteria)
        if (itemCriteria.length == 0) {
          return Promise.resolve([])
        }
        // console.log('cart checkout', itemCriteria)
        // console.log('CRITERIA',criteria)
        return Collection.findAll({
          where: {
            id: itemCriteria,
            $and: {
              $or: {
                discount_rate: {
                  $gt: 0
                },
                discount_percentage: {
                  $gt: 0
                }
              }
            }
          },
          attributes: [
            'id',
            'title',
            'discount_type',
            'discount_scope',
            'discount_rate',
            'discount_percentage',
            'discount_product_include',
            'discount_product_exclude'
          ],
          transaction: options.transaction || null
        })
          .then(collections => {
            return Promise.all(collections.map(collection => {
              if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL) {
                // console.log('cart checkout Needs Products', collection.id)
                return Collection.findOne({
                  where: {
                    id: collection.id
                  },
                  attributes: [
                    'id',
                    'title',
                    'discount_type',
                    'discount_scope',
                    'discount_rate',
                    'discount_percentage',
                    'discount_product_include',
                    'discount_product_exclude'
                  ],
                  include: [
                    {
                      model: this.app.orm['Product'],
                      as: 'products',
                      where: {
                        $or: {
                          id: productIds
                        }
                      },
                      attributes: ['id','type']
                    }
                  ],
                  transaction: options.transaction || null
                })
              }
              else {
                collection.products = []
                return collection
              }
            }))
          })
      })
  }

  /**
   *
   * @param subscription
   * @param options
   * @returns {*}
   */
  subscriptionCollections(subscription, options) {
    options = options || {}
    const Collection = this.app.orm['Collection']
    const ItemCollection = this.app.orm['ItemCollection']
    const criteria = []
    const productIds = []
    const customerIds = []

    if (subscription.customer_id) {
      criteria.push({model: 'customer', model_id: subscription.customer_id})
      customerIds.push(subscription.customer_id)
    }

    subscription.line_items.forEach(item => {
      criteria.push({model: 'product', model_id: item.product_id})
      productIds.push(item.product_id)
    })

    if (criteria.length == 0) {
      return Promise.resolve([])
    }
    // console.log('CRITERIA ONE', criteria)

    return ItemCollection.findAll({
      where: { $or: criteria},
      attributes: ['collection_id', 'model', 'model_id'],
      transaction: options.transaction || null
    })
      .then(itemCollections => {
        // console.log('cart checkout',itemCollections)
        const itemCriteria = []

        itemCollections.forEach(item => {
          // console.log('FOUND COLLECTION', item.get({plain: true}))
          if (itemCriteria.indexOf(item.collection_id) == -1) {
            itemCriteria.push(item.collection_id)
          }
          return
        })

        // console.log('CRITERIA TWO', itemCriteria)
        if (itemCriteria.length == 0) {
          return Promise.resolve([])
        }
        // console.log('CRITERIA',criteria)
        return Collection.findAll({
          where: {
            id: itemCriteria,
            $and: {
              $or: {
                discount_rate: {
                  $gt: 0
                },
                discount_percentage: {
                  $gt: 0
                }
              }
            }
          },
          attributes: [
            'id',
            'title',
            'discount_type',
            'discount_scope',
            'discount_rate',
            'discount_percentage',
            'discount_product_include',
            'discount_product_exclude'
          ],
          transaction: options.transaction || null
        })
          .then(collections => {
            return Promise.all(collections.map(collection => {
              if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL) {
                // console.log('cart checkout Needs Products', collection.id)
                return Collection.findOne({
                  where: {
                    id: collection.id
                  },
                  attributes: [
                    'id',
                    'title',
                    'discount_type',
                    'discount_scope',
                    'discount_rate',
                    'discount_percentage',
                    'discount_product_include',
                    'discount_product_exclude'
                  ],
                  include: [
                    {
                      model: this.app.orm['Product'],
                      as: 'products',
                      where: {
                        $or: {
                          id: productIds
                        }
                      },
                      attributes: ['id','type']
                    }
                  ],
                  transaction: options.transaction || null
                })
              }
              else {
                collection.products = []
                return collection
              }
            }))
          })
      })
  }

  /**
   *
   * @param customer
   * @param products
   * @param options
   * @returns {*}
   */
  customerCollections(customer, products, options) {
    options = options || {}
    const Collection = this.app.orm['Collection']
    const ItemCollection = this.app.orm['ItemCollection']
    const criteria = []
    const productIds = []
    const customerIds = []

    if (!customer) {
      customer = {}
    }
    if (!products) {
      products = []
    }

    if (customer.id) {
      criteria.push({model: 'customer', model_id: customer.id})
      customerIds.push(customer.id)
    }

    products.forEach(item => {
      criteria.push({model: 'product', model_id: item.id})
      productIds.push(item.id)
    })

    if (criteria.length == 0) {
      return Promise.resolve([])
    }
    // console.log('CRITERIA ONE', criteria)
    return ItemCollection.findAll({
      where: {
        $or: criteria
      },
      attributes: ['collection_id', 'model', 'model_id'],
      transaction: options.transaction || null
    })
      .then(itemCollections => {
        // console.log('cart checkout', itemCollections)
        // console.log('CRITERIA FOUND',itemCollections)
        const itemCriteria = []

        itemCollections.forEach(item => {
          // console.log('FOUND COLLECTION', item.get({plain: true}))
          if (itemCriteria.indexOf(item.collection_id) == -1) {
            itemCriteria.push(item.collection_id)
          }
        })

        // console.log('CRITERIA TWO', itemCriteria)
        if (itemCriteria.length == 0) {
          return Promise.resolve([])
        }
        // console.log('cart checkout', itemCriteria)
        // console.log('CRITERIA',criteria)
        return Collection.findAll({
          where: {
            id: itemCriteria,
            $and: {
              $or: {
                discount_rate: {
                  $gt: 0
                },
                discount_percentage: {
                  $gt: 0
                }
              }
            }
          },
          attributes: [
            'id',
            'title',
            'discount_type',
            'discount_scope',
            'discount_rate',
            'discount_percentage',
            'discount_product_include',
            'discount_product_exclude'
          ],
          transaction: options.transaction || null
        })
          .then(collections => {
            return Promise.all(collections.map(collection => {
              if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL) {
                // console.log('cart checkout Needs Products', collection.id)
                return Collection.findOne({
                  where: {
                    id: collection.id
                  },
                  attributes: [
                    'id',
                    'title',
                    'discount_type',
                    'discount_scope',
                    'discount_rate',
                    'discount_percentage',
                    'discount_product_include',
                    'discount_product_exclude'
                  ],
                  include: [
                    {
                      model: this.app.orm['Product'],
                      as: 'products',
                      where: {
                        $or: {
                          id: productIds
                        }
                      },
                      attributes: ['id','type']
                    }
                  ],
                  transaction: options.transaction || null
                })
              }
              else {
                collection.products = []
                return collection
              }
            }))
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
        if (!hasCollection) {
          return resCollection.addCollection(resSubCollection.id, {transaction: options.transaction || null})
        }
        return resCollection
      })
      .then(() => {
        return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
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
        return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
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
        if (!hasCollection) {
          return resCollection.addProduct(resProduct.id, {transaction: options.transaction || null})
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
        return Customer.resolve(customer, {transaction: options.transaction || null})
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
        return Collection.findByIdDefault(resCollection.id, {transaction: options.transaction || null})
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
        return Customer.resolve(customer)
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
        return Collection.findByIdDefault(resCollection.id)
      })
  }
}

