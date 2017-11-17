'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Create Variant
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.variant, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Variant
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.variant, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Remove Product Variant
  remove(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.variant, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Remove Product Variants
  removeVariants(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.removeVariants, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
