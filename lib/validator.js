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
      joi.validate(data, lib.Schemas.product.add, (err, value) => {
        if (err) {
          return reject(new errors.product.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate updateProducts
  validateUpdateProducts (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.update, (err, value) => {
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
      joi.validate(data, lib.Schemas.product.remove, (err, value) => {
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
      joi.validate(data, lib.Schemas.cart.checkout, (err, value) => {
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
      joi.validate(data, lib.Schemas.cart.addItems, (err, value) => {
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
      joi.validate(data, lib.Schemas.cart.removeItems, (err, value) => {
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
      joi.validate(data, lib.Schemas.cart.clear, (err, value) => {
        if (err) {
          return reject(new errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
