'use strict'
const joi = require('joi')
const taxes = require('./taxes')
module.exports = joi.alternatives().try(
  taxes,
  joi.array().items(taxes)
)
