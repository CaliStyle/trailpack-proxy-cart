'use strict'

const Trailpack = require('trailpack')
const _ = require('lodash')
const lib = require('./lib')

module.exports = class ProxyCartTrailpack extends Trailpack {

  /**
   * Validates Configs
   */
  validate () {
    if (!_.includes(_.keys(this.app.packs), 'express')) {
      return Promise.reject(new Error('This Trailpack only works for express!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'sequelize')) {
      return Promise.reject(new Error('This Trailpack only works for Sequelize!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-engine')) {
      return Promise.reject(new Error('This Trailpack requires trailpack-proxy-engine!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-cart-countries')) {
      return Promise.reject(new Error('This Trailpack requires trailpack-proxy-cart-countries!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-generics')) {
      return Promise.reject(new Error('This Trailpack requires trailpack-proxy-generics!'))
    }

    if (!this.app.config.proxyEngine) {
      return Promise.reject(new Error('No configuration found at config.proxyEngine!'))
    }

    if (!this.app.config.proxyCart) {
      return Promise.reject(new Error('No configuration found at config.proxyCart!'))
    }

    if (!this.app.config.proxyGenerics) {
      return Promise.reject(new Error('No configuration found at config.proxyGenerics!'))
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
      lib.Validator.validateProxyCart.config(this.app.config.proxyCart)
    ])
  }

  /**
   * Adds Routes, Policies, Generics, and Agenda
   */
  configure () {
    return Promise.all([
      lib.ProxyCart.addPolicies(this.app),
      lib.ProxyCart.addRoutes(this.app),
      lib.ProxyCart.addAgenda(this.app),
      lib.ProxyCart.resolveGenerics(this.app),
      lib.ProxyCart.copyDefaults(this.app)
    ])
  }

  /**
   * Loads default shop fixtures
   */
  initialize () {
    return Promise.all([
      lib.ProxyCart.init(this.app),
      lib.Utils.buildShopFixtures(this.app)
        .then(fixtures => {
          this.shopFixtures = fixtures
          return lib.Utils.loadFixtures(this.app)
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

