'use strict'

const Trailpack = require('trailpack')
const _ = require('lodash')
const lib = require('./lib')

module.exports = class ProxyCartTrailpack extends Trailpack {

  /**
   * Validates Configs
   */
  validate (app) {
    if (!_.includes(_.keys(this.app.packs), 'express')) {
      return Promise.reject(new Error('This Trailpack only works for express!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'sequelize')) {
      return Promise.reject(new Error('This Trailpack only works for Sequelize!'))
    }

    if (!this.app.config.proxyCart) {
      return Promise.reject(new Error('No configuration found at config.proxyCart!'))
    }

    return Promise.all([
      lib.Validator.validateDatabaseConfig(this.app.config.database),
      lib.Validator.validateProxyCartConfig(this.app.config.proxyCart)
    ])
  }

  /**
   * Adds Routes
   */
  configure (app) {
    return Promise.all([
      lib.ProxyCart.addRoutes(this.app)
    ])
  }

  /**
   * TODO document method
   */
  initialize (app) {

  }

  constructor (app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

