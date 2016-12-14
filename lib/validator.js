/* eslint no-console: [0] */
'use strict'

const joi = require('joi')
const lib = require('.')
const errors = require('./errors')

module.exports = {
  // Validate Database Config
  validateDatabaseConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, lib.Schemas.databaseConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.database: ' + err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Proxy Cart Config
  validateProxyCartConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, lib.Schemas.proxyCartConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.proxyCart: ' + err))
        }
        return resolve(value)
      })
    })
  },

  // Validate addProducts
  validateAddProducts (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.addProducts, (err, value) => {
        if (err) {
          return reject(new errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate updateProducts
  validateUpdateProducts (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.updateProducts, (err, value) => {
        if (err) {
          return reject(new errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate removeProducts
  validateRemoveProducts (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.removeProducts, (err, value) => {
        if (err) {
          return reject(new errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },

  // Validate checkout
  validateCheckout (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.checkout, (err, value) => {
        if (err) {
          return reject(new errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate addItemsToCart
  validateAddItemsToCart (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.addItemsToCart, (err, value) => {
        if (err) {
          return reject(new errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate removeItemsFromCart
  validateRemoveItemsFromCart (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.removeItemsFromCart, (err, value) => {
        if (err) {
          return reject(new errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate clearCart
  validateClearCart (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.clearCart, (err, value) => {
        if (err) {
          return reject(new errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
