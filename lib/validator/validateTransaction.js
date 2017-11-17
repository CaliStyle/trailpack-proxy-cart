'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Authorize Transaction
  authorize(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.transaction.transaction, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Capture Transaction
  capture(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.transaction.transaction, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Sale Transaction
  sale(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.transaction.transaction, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Void Transaction
  void(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.transaction.transaction, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Refund Transaction
  refund(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.transaction.transaction, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  retry(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.transaction.transaction, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  cancel(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.transaction.transaction, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
