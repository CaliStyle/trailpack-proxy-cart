'use strict'

const Service = require('trails/service')
// const _ = require('lodash')
// const Errors = require('proxy-engine-errors')

/**
 * @module ShopService
 * @description Shop Service
 */
module.exports = class ShopService extends Service {
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

