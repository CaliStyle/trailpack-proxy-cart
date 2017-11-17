'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Add Address
  add(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.address.address, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Address
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.address.address, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Remove Address
  remove(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.address.address, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
