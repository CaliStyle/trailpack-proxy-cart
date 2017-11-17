'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Create Customer
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.customer.customer, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Customer
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.customer.customer, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Customer Account Balance
  accountBalance(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.customer.accountBalance, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
