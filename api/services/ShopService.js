'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')

/**
 * @module ShopService
 * @description Shop Service
 */
module.exports = class ShopService extends Service {
  resolve(shop, options) {
    const Shop =  this.app.orm.Shop
    if (shop instanceof Shop.Instance){
      return Promise.resolve(shop)
    }
    else if (shop && _.isObject(shop) && shop.id) {
      return Shop.findById(shop.id, options)
        .then(resShop => {
          if (!resShop) {
            throw new Errors.FoundError(Error(`Shop ${shop.id} not found`))
          }
          return resShop
        })
    }
    else if (shop && (_.isString(shop) || _.isNumber(shop))) {
      return Shop.find({
        where: {
          id: shop,
          handle: shop
        }
      }, options)
        .then(resShop => {
          if (!resShop) {
            throw new Errors.FoundError(Error(`Shop ${shop} not found`))
          }
          return resShop
        })
    }
    else {
      const err = new Error('Unable to resolve Shop')
      Promise.reject(err)
    }
  }

  /**
   *
   * @param data
   * @param options
   * @returns {data}
   */
  create(data, options) {
    const Shop = this.app.orm.Shop
    return Shop.create(data, options)
  }
}

