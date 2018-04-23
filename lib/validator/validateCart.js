'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Creating a cart
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.cart, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Updating a cart
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.cart, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Cart Checkout
  checkout(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.checkout, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Items to add to cart
  addItems(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.addItems, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Items to update in cart
  updateItems(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.updateItems, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Items to remove from cart
  removeItems(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.removeItems, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  addShipping(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.addShipping, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  removeShipping(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.removeShipping, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  addTaxes(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.addTaxes, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  removeTaxes(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.removeTaxes, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Clearing all items from the cart
  clear(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.clear, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Pricing Overrides
  pricingOverrides(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.cart.pricingOverrides, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
