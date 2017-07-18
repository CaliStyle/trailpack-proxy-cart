'use strict'
const joi = require('joi')
const fulfillment = require('./fulfillment')
module.exports = joi.alternatives().try(
  fulfillment,
  joi.array().items(fulfillment)
)
