'use strict'
const joi = require('joi')
module.exports = joi.alternatives().try(
  joi.number(),
  joi.string()
)
