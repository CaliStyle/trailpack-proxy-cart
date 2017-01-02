/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
/**
 * @module CollectionService
 * @description Collection Service
 */
module.exports = class CollectionService extends Service {
  resolve(collection){
    // console.log('THIS COLLECTION TERM', collection)
    const Collection =  this.app.services.ProxyEngineService.getModel('Collection')
    if (collection instanceof Collection.Instance){
      // console.log('INSTANCE OF COLLECTION')
      return Promise.resolve(collection)
    }
    else if (collection && _.isObject(collection) && collection.id) {
      return Collection.findById(collection.id)
    }
    else if (collection && _.isObject(collection) && collection.handle) {
      // console.log('FIND OR CREATE 1 COLLECTION', collection)
      return Collection.findOrCreate({
        where: {
          handle: collection.handle
        },
        default: collection
      })
    }
    else if (collection && _.isString(collection)) {
      return Collection.create({title: collection})
      // console.log('FIND OR CREATE 2 COLLECTION', collection)
      // return Collection.findOrCreate({
      //   where: {
      //     $or: {
      //       handle: collection,
      //       title: collection,
      //       id: collection
      //     }
      //   },
      //   default: {
      //     title: collection
      //   }
      // })
    }
  }
}

