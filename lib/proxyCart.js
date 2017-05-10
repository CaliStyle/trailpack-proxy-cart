/* eslint no-console: [0] */
'use strict'

const _ = require('lodash')
const routes = require('./routes')
const policies = require('./policies')

module.exports = {

  /**
   * configure
   * @param app
   */
  configure: (app) => {
    const proxyCart = app.services.ProxyCartService
    app.config.web.middlewares.proxyCartInit = proxyCart.initialize(proxyCart)
    app.config.web.middlewares.proxyCartSession = proxyCart.authenticate(proxyCart)
    app.config.web.middlewares.proxyCartSessionCart = proxyCart.cart(proxyCart)
    app.config.web.middlewares.proxyCartSessionCustomer = proxyCart.customer(proxyCart)
    return Promise.resolve()
  },
  /**
   * addRoutes - Add the Proxy Cart controller routes
   * @param app
   * @returns {Promise.<{}>}
   */
  addRoutes: (app) => {
    const prefix = _.get(app.config, 'footprints.prefix')
    const routerUtil = app.packs.router.util
    if (prefix){
      routes.forEach(route => {
        route.path = prefix + route.path
      })
    }
    app.config.routes = routerUtil.mergeRoutes(routes, app.config.routes)
    return Promise.resolve({})
  },
  /**
   * addPolicies - Add the Proxy Cart default Policies
   * @param app
   * @returns {Promise.<{}>}
   */
  addPolicies: (app) => {
    app.config.policies = _.merge(policies, app.config.policies)
    return Promise.resolve({})
  },
  /**
   * copyDefaults - Copies the default configuration so that it can be restored later
   * @param app
   * @returns {Promise.<{}>}
   */
  copyDefaults: (app) => {
    app.config.proxyCartDefaults = _.clone(app.config.proxyCart)
    return Promise.resolve({})
  },
  /**
   * resolveGenerics - adds default generics if missing from configuration
   * @param app
   * @returns {Promise.<{}>}
   */
  resolveGenerics: (app) => {
    if (!app.config.proxyGenerics) {
      app.config.proxyGenerics = {}
    }
    if (!app.config.proxyGenerics.shipping_provider) {
      app.config.proxyGenerics.shipping_provider = {
        adapter: require('../api/generics').shippingProvider,
        options: {}
      }
    }
    if (!app.config.proxyGenerics.fulfillment_provider) {
      app.config.proxyGenerics.fulfillment_provider = {
        adapter: require('../api/generics').fulfillmentProvider,
        options: {}
      }
    }
    if (!app.config.proxyGenerics.tax_provider) {
      app.config.proxyGenerics.tax_provider = {
        adapter: require('../api/generics').taxProvider,
        options: {}
      }
    }
    if (!app.config.proxyGenerics.image_provider) {
      app.config.proxyGenerics.image_provider = {
        adapter: require('../api/generics').imageProvider,
        options: {}
      }
    }
    if (!app.config.proxyGenerics.geolocation_provider) {
      app.config.proxyGenerics.geolocation_provider = {
        adapter: require('../api/generics').geolocationProvider,
        options: {}
      }
    }
    if (!app.config.proxyGenerics.render_service) {
      app.config.proxyGenerics.render_service = {
        adapter: require('proxy-generics-render'),
        options: {
          // Must always be set to true
          html: true
        },
        plugins: [
          // Example Plugin (markdown-it-meta is required and already installed)
          // {
          //   plugin: require('markdown-it-meta'),
          //   options: {}
          // }
        ]
      }
    }
    return Promise.resolve({})
  },
  /**
   * add Cron Jobs to Proxy Engine
   * @param app
   * @returns {Promise.<{}>}
   */
  addCrons: (app) => {
    if (!app.api.crons) {
      app.api.crons  = {}
    }
    return Promise.resolve({})
  },
  /**
   * add Events to Proxy Engine
   * @param app
   * @returns {Promise.<{}>}
   */
  addEvents: (app) => {
    if (!app.api.events) {
      app.api.events  = {}
    }
    return Promise.resolve({})
  },
  /**
   * add Tasks to Proxy Engine
   * @param app
   * @returns {Promise.<{}>}
   */
  addTasks: (app) => {
    if (!app.api.tasks) {
      app.api.tasks  = {}
    }
    return Promise.resolve({})
  }
}
