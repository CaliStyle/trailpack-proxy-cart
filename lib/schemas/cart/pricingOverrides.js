'use strict'
const joi = require('joi')
// const itemSchema = require('./line_item')
module.exports = joi.alternatives().try(
  joi.array().items(joi.object({
    name: joi.string(),
    price: joi.number().required()
  })),
  joi.object().keys({
    id: joi.number(),
    pricing_overrides: joi.array().items(joi.object({
      name: joi.string(),
      price: joi.number().required()
    }))
  })
)
