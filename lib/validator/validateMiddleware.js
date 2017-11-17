'use strict'

const joi = require('joi')
const lib = require('../')

module.exports = {
  config(middleware) {
    return new Promise((resolve, reject) => {
      joi.validate(middleware, lib.Schemas.proxyCartMiddleware, (err, value) => {
        if (err) {
          return reject(new TypeError('config.web.middleware: ' + err))
        }
        return resolve(value)
      })
    })
  },
}
