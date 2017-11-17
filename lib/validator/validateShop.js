'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.shop.shop, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
