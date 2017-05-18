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
   *
   * @param collection
   * @param options
   * @returns {Promise<T>|Collection}
   */
  resolve(collection, options){
    const Collection =  this.app.orm.Collection

    if (!options) {
      options = {}
    }

    if (collection instanceof Collection.Instance){
      return Promise.resolve(collection)
    }
    else if (collection && _.isObject(collection) && collection.id) {
      return Collection.findById(collection.id, options)
        .then(foundCollection => {
          if (!foundCollection) {
            // TODO create proper error
            throw new Error(`Collection with ${collection.id} not found`)
          }
          return foundCollection
        })
    }
    else if (collection && _.isObject(collection) && (collection.handle || collection.title)) {
      return Collection.findOne({
        where: {
          $or: {
            handle: collection.handle,
            title: collection.title
          }
        }
      }, options)
        .then(resCollection => {
          if (resCollection) {
            return resCollection
          }
          return Collection.create(collection, options)
        })
    }
    else if (collection && _.isString(collection)) {
      return Collection.findOne({
        where: {
          $or: {
            handle: collection,
            title: collection,
            id: collection
          }
        }
      }, options)
        .then(resCollection => {
          if (resCollection) {
            return resCollection
          }
          return Collection.create({title: collection})
        })
    }
    else {
        // TODO make Proper Error
      const err = new Error(`Not able to resolve collection ${collection}`)
      return Promise.reject(err)
    }
  }

  /**
   *
   * @param collection
   * @param options
   * @returns {collection}
   */
  create(collection, options) {
    const Collection =  this.app.orm.Collection
    return Collection.create(collection, options)
  }

  /**
   *
   * @param collection
   * @param options
   * @returns {Promise<T>|Collection}
   */
  update(collection, options) {
    const Collection =  this.app.orm.Collection
    if (!collection.id) {
      const err = new Errors.FoundError(Error('Collection is missing id'))
      return Promise.reject(err)
    }
    const update = _.omit(collection,['id','created_at','updated_at'])
    return Collection.findById(collection.id)
      .then(resCollection => {
        return resCollection.update(update, options)
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
    let resCollection, resSubCollection
    return this.resolve(collection)
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return this.resolve(subCollection)
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
      .then(collection => {
        return this.app.orm['Collection'].findByIdDefault(resCollection.id)
      })
  }

  /**
   *
   * @param collection
   * @param subCollection
   * @returns {Promise.<TResult>}
   */
  removeCollection(collection, subCollection){
    let resCollection, resSubCollection
    return this.resolve(collection)
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = collection
        return this.resolve(subCollection)
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
        return this.app.orm['Collection'].findByIdDefault(resCollection.id)
      })
  }
}

