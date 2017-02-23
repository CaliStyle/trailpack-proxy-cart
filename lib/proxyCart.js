/* eslint no-console: [0] */
'use strict'

const _ = require('lodash')
const routes = require('./routes')
const policies = require('./policies')
const agenda = require('./agenda')

module.exports = {

  /**
   * init - Initialize
   * @param app
   */
  init: (app) => {
    // _.each(app.config.proxyCart.subcribers, subscriber => {
    //   if (subscriber.name && subscriber.type && subscriber.fn) {
    //     app.services.ProxyEngineService.subscribe(`proxyCart.subscribers.${subscriber.name}`, subscriber.type, subscriber.fn)
    //   }
    // })
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
   * addAgenda - Add the Proxy Cart Agenda
   * @param app
   * @returns {Promise.<{}>}
   */
  addAgenda: (app) => {
    if (!app.config.proxyAgenda) {
      app.config.proxyAgenda = []
    }
    app.config.proxyAgenda = _.union(agenda, app.config.proxyAgenda)
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
        adapter: require('../api/generics').renderService,
        options: {
          // Must always be set to true
          html: true
        },
        plugins: [
          // Example Plugin (markdownit-meta is required and already installed)
          // {
          //   plugin: require('markdownit-meta'),
          //   options: {}
          // }
        ]
      }
    }
    return Promise.resolve({})
  }
}
