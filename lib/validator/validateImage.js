'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate remove Product Image
  remove(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.image, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate remove Product Images
  removeImages(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.product.removeImages, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
