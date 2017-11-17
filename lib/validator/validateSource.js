'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Add Source
  add(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.source.source, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Source
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.source.source, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Remove Source
  remove(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.source.source, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
