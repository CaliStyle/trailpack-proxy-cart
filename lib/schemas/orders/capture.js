'use strict'
const joi = require('joi')

module.exports = joi.array().items(joi.object().keys({
  transaction: joi.any()
}))
