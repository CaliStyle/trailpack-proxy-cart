'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Collection Create
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.collection.collection, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Collection Update
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.collection.collection, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
