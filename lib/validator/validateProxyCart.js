'use strict'

const joi = require('joi')
const lib = require('../')

module.exports = {
  config(config){
    return new Promise((resolve, reject) => {
      joi.validate(config, lib.Schemas.proxyCartConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.proxyCart: ' + err))
        }
        return resolve(value)
      })
    })
  }
}
