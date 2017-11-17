'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Add Product
  add(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.product, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Add Products
  addProducts(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.add, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Product
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.product, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Products
  updateProducts(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.update, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Remove Product
  remove(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.product, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Remove Products
  removeProducts(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.remove, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
