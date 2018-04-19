'use strict'
const joi = require('joi')
const itemSchema = require('./addItem')
module.exports =  joi.alternatives().try(
  joi.object().keys({
    order_items: joi.array().items(itemSchema)
  }).unknown(),
  joi.array().items(itemSchema)
)
