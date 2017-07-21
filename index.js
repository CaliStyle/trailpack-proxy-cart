'use strict'

const Trailpack = require('trailpack')
const _ = require('lodash')
const lib = require('./lib')

module.exports = class ProxyCartTrailpack extends Trailpack {

  /**
   * Validates Configs
   */
  validate () {
    // Packs
    if (!_.includes(_.keys(this.app.packs), 'express')) {
      return Promise.reject(new Error('Trailpack-proxy-cart only works for express!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'sequelize')) {
      return Promise.reject(new Error('Trailpack-proxy-cart only works for Sequelize!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-engine')) {
      return Promise.reject(new Error('Trailpack-proxy-cart requires trailpack-proxy-engine!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-permissions')) {
      return Promise.reject(new Error('Trailpack-proxy-cart requires trailpack-proxy-permissions!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-passport')) {
      return Promise.reject(new Error('Trailpack-proxy-cart requires trailpack-proxy-passport!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-notifications')) {
      return Promise.reject(new Error('Trailpack-proxy-cart requires trailpack-proxy-notifications!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-cart-countries')) {
      return Promise.reject(new Error('Trailpack-proxy-cart requires trailpack-proxy-cart-countries!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-generics')) {
      return Promise.reject(new Error('Trailpack-proxy-cart requires trailpack-proxy-generics!'))
    }
    // Configs
    if (!this.app.config.proxyEngine) {
      return Promise.reject(new Error('No configuration found at config.proxyEngine!'))
    }

    if (!this.app.config.proxyCart) {
      return Promise.reject(new Error('No configuration found at config.proxyCart!'))
    }

    if (!this.app.config.proxyNotifications) {
      return Promise.reject(new Error('No configuration found at config.proxyCart!'))
    }

    if (!this.app.config.proxyGenerics) {
      return Promise.reject(new Error('No configuration found at config.proxyGenerics!'))
    }
    if (!this.app.config.proxyPermissions) {
      return Promise.reject(new Error('No configuration found at config.proxyPermissions!'))
    }
    if (!this.app.config.proxyPassport) {
      return Promise.reject(new Error('No configuration found at config.proxyPassport!'))
    }

    if (
      this.app.config.policies
      && this.app.config.policies['*']
      && this.app.config.policies['*'].indexOf('CheckPermissions.checkRoute') === -1
    ) {
      this.app.log.warn('ProxyCart Routes are unlocked! add \'*\' : [\'CheckPermissions.checkRoute\'] to config/policies.js')
    }

    return Promise.all([
      lib.Validator.validateDatabase.config(this.app.config.database),
      lib.Validator.validateProxyCart.config(this.app.config.proxyCart),
      lib.Validator.validateMiddleware(this.app.config.web.middlewares)
    ])
  }

  /**
   * Adds Routes, Policies, Generics, and Agenda
   */
  configure () {
    return Promise.all([
      lib.ProxyCart.configure(this.app),
      lib.ProxyCart.addPolicies(this.app),
      lib.ProxyCart.addRoutes(this.app),
      lib.ProxyCart.resolveGenerics(this.app),
      lib.ProxyCart.copyDefaults(this.app),
      lib.ProxyCart.addCrons(this.app),
      lib.ProxyCart.addEvents(this.app),
      lib.ProxyCart.addTasks(this.app)
    ])
  }

  /**
   * Loads default shop and country fixtures
   */
  initialize () {
    return Promise.all([
      lib.Utils.buildShopFixtures(this.app)
        .then(fixtures => {
          this.shopFixtures = fixtures
          return lib.Utils.loadShopFixtures(this.app)
        }),
      lib.Utils.buildCountryFixtures(this.app)
        .then(fixtures => {
          this.countryFixtures = fixtures
          return lib.Utils.loadCountryFixtures(this.app)
        })
    ])
  }

  constructor (app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

