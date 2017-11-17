'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Create Review
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.review.review, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Review
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.review.review, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Destroy Review
  destroy(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.review.review, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
