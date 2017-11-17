'use strict'

const joi = require('joi')
const lib = require('../')

module.exports = {
  // Validate Database Config
  config(config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, lib.Schemas.databaseConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.database: ' + err))
        }
        return resolve(value)
      })
    })
  }
}
