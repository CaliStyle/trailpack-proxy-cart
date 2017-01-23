/* eslint no-console: [0] */
'use strict'

const lib = require('./')
// const _ = require('lodash')

module.exports = {
  buildShopFixtures: (app) => {
    const fixtures = {
      shops: []
    }
    fixtures.shops.push(app.config.proxyCart.nexus)
    // console.log('utils.buildShopFixtures', fixtures)
    return Promise.resolve(fixtures)
  },
  loadFixtures: (app) => {
    return app.orm.Shop.findAll()
      .then(shops => {
        if (!shops || shops.length === 0) {
          app.log.debug('utils.loadFixtures: Shops empty, loadShops...')
          return lib.Utils.loadShops(app)
        }
        else {
          return
        }
      })
  },
  loadShops: (app) => {
    const shops = app.packs['proxy-cart'].shopFixtures.shops
    if (shops.length > 0) {
      app.log.debug('utils.loadShops Promise All()')
      return Promise.all(shops.map(shop => {
        return app.orm.Shop.create(shop)
      }))
    }
  }
}
