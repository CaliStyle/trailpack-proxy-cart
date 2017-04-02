/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')

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
    return new Promise((resolve, reject) => {

      const Collection =  this.app.orm.Collection
      const Sequelize = Collection.sequelize

      if (collection instanceof Collection.Instance){
        return resolve(collection)
      }
      else if (collection && _.isObject(collection) && collection.id) {
        Collection.findById(collection.id, options)
          .then(foundCollection => {
            if (!foundCollection) {
              // TODO create proper error
              const err = new Error(`Collection with ${collection.id} not found`)
              return reject(err)
            }
            return resolve(foundCollection)
          })
          .catch(err => {
            return reject(err)
          })
      }
      else if (collection && _.isObject(collection) && (collection.handle || collection.title)) {
        Sequelize.transaction(t => {
          return Collection.find({
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
        })
          .then(result => {
            // console.log(result)
            return resolve(result)
          })
          .catch(err => {
            return reject(err)
          })
      }
      else if (collection && _.isString(collection)) {
        // return Collection.create({title: collection})
        // Make this a transaction
        Sequelize.transaction(t => {
          return Collection.find({
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
        })
          .then(result => {
            return resolve(result)
          })
          .catch(err => {
            return reject(err)
          })
      }
      else {
        // TODO make Proper Error
        const err = new Error(`Not able to resolve collection ${collection}`)
        return reject(err)
      }
    })
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
      where: { $or: criteria},
      attributes: ['collection_id', 'model', 'model_id']
    })
      .then(itemCollections => {
        // console.log('CRITERIA FOUND',itemCollections)
        const itemCriteria = []

        itemCollections.forEach(item => {
          // console.log('FOUND COLLECTION', item.get({plain: true}))
          itemCriteria.push(item.collection_id)
          return
        })

        // console.log('CRITERIA TWO', itemCriteria)
        if (itemCriteria.length == 0) {
          return Promise.resolve([])
        }
        // console.log('CRITERIA',criteria)
        return Collection.findAll({
          where: {
            id: itemCriteria
          },
          attributes: [
            'id',
            'title',
            'discount_type',
            'discount_scope',
            'discount_rate',
            'discount_percentage'
          ],
          include: [{
            model: this.app.orm['Product'],
            as: 'products',
            where: {
              id: productIds
            },
            attributes: ['id']
          }]
        })
      })
  }
}

