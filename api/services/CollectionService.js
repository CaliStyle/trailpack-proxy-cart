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
}

