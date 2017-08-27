'use strict'
const joi = require('joi')
const itemSchema = require('./lineItem')
module.exports =  joi.alternatives().try(
  joi.object().keys({
    line_items: joi.array().items(itemSchema)
  }).unknown(),
  joi.array().items(itemSchema)
)
