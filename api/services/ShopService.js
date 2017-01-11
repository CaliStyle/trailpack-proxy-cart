'use strict'

const Service = require('trails/service')

/**
 * @module ShopService
 * @description Shop Service
 */
module.exports = class ShopService extends Service {
  create(data) {
    const Shop = this.app.services.ProxyEngineService.getModel('Shop')
    return Shop.create(data)
  }
}

