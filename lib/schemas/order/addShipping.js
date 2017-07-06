'use strict'
const joi = require('joi')
const shipping = require('./shipping')
module.exports = joi.alternatives().try(
  shipping,
  joi.array().items(shipping)
)
