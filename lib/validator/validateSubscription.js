'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Creating a subscription
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.subscription.subscription, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Subscription
  update(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.subscription.subscription, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Cancelling a subscription
  cancel(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.subscription.cancel, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate activating a subscription
  activate(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.subscription.activate, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate activating a subscription
  deactivate(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.subscription.deactivate, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Items to add to subscription
  addItems(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.subscription.addItems, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Items to remove from subscription
  removeItems(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.subscription.removeItems, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
