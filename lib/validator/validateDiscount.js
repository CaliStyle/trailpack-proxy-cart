'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Create Discount
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.discount.create, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate update discount
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.discount.update, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate destroy discount
  destroy(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.discount.destroy, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
