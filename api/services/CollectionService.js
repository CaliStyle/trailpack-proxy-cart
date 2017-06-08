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

    return Collection.findOne({
      where: {
        handle: collection.handle
      },
      attributes: ['id'],
      transaction: options.transaction || null
    })
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

    const Collection =  this.app.orm.Collection
    let resCollection
    const create = _.omit(collection, ['collections'])
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
          return resCollection.setCollections(_.map(collections, c => c.id), {transaction: options.transaction || null})
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
    if (!collection.id) {
      const err = new Errors.FoundError(Error('Collection is missing id'))
      return Promise.reject(err)
    }
    let resCollection
    const update = _.omit(collection,['id','created_at','updated_at','collections'])
    return Collection.findById(collection.id)
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
          return resCollection.setCollections(_.map(collections, c => c.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(() => {
        return Collection.findByIdDefault(resCollection.id, options)
      })
  }

  /**
   *
   * @param cart
   * @returns {*}
   */
  cartCollections(cart) {
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
      attributes: ['collection_id', 'model', 'model_id']
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
          ]
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
                  ]
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
   * @returns {*}
   */
  subscriptionCollections(subscription) {
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
      attributes: ['collection_id', 'model', 'model_id']
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
          ]
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
                  ]
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
   * @returns {*}
   */
  customerCollections(customer, products) {
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
      attributes: ['collection_id', 'model', 'model_id']
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
          ]
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
                  ]
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
   * @returns {Promise.<TResult>}
   */
  addCollection(collection, subCollection){
    const Collection = this.app.orm['Collection']
    let resCollection, resSubCollection
    return Collection.resolve(collection)
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Collection.resolve(subCollection)
      })
      .then(subCollection => {
        if (!subCollection) {
          throw new Errors.FoundError(Error('Sub Collection not found'))
        }
        resSubCollection = subCollection
        return resCollection.hasCollection(resSubCollection.id)
      })
      .then(hasCollection => {
        if (!hasCollection) {
          return resCollection.addCollection(resSubCollection.id)
        }
        return resCollection
      })
      .then(() => {
        return Collection.findByIdDefault(resCollection.id)
      })
  }

  /**
   *
   * @param collection
   * @param subCollection
   * @returns {Promise.<TResult>}
   */
  removeCollection(collection, subCollection){
    const Collection = this.app.orm['Collection']
    let resCollection, resSubCollection
    return Collection.resolve(collection)
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Collection.resolve(subCollection)
      })
      .then(subCollection => {
        if (!subCollection) {
          throw new Errors.FoundError(Error('Sub Collection not found'))
        }
        resSubCollection = subCollection
        return resCollection.hasCollection(resSubCollection.id)
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resCollection.removeCollection(resSubCollection.id)
        }
        return resCollection
      })
      .then(collection => {
        return Collection.findByIdDefault(resCollection.id)
      })
  }

  /**
   *
   * @param collection
   * @param product
   * @returns {Promise.<TResult>}
   */
  addProduct(collection, product){
    const Collection = this.app.orm['Collection']
    const Product = this.app.orm['Product']
    let resCollection, resProduct
    return Collection.resolve(collection)
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Product.resolve(product)
      })
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return resCollection.hasProduct(resProduct.id)
      })
      .then(hasCollection => {
        if (!hasCollection) {
          return resCollection.addProduct(resProduct.id)
        }
        return resCollection
      })
      .then(collection => {
        return Collection.findByIdDefault(resCollection.id)
      })
  }

  /**
   *
   * @param collection
   * @param product
   * @returns {Promise.<TResult>}
   */
  removeProduct(collection, product){
    const Collection = this.app.orm['Collection']
    const Product = this.app.orm['Product']
    let resCollection, resProduct
    return Collection.resolve(collection)
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return Product.resolve(product)
      })
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return resCollection.hasProduct(resProduct.id)
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resCollection.removeProduct(resProduct.id)
        }
        return resCollection
      })
      .then(collection => {
        return Collection.findByIdDefault(resCollection.id)
      })
  }

  /**
   *
   * @param collection
   * @param customer
   * @returns {Promise.<TResult>}
   */
  addCustomer(collection, customer){
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
        if (!hasCollection) {
          return resCollection.addCustomer(resCustomer.id)
        }
        return resCollection
      })
      .then(collection => {
        return Collection.findByIdDefault(resCollection.id)
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

