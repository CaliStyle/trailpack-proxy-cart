'use strict'
const joi = require('joi')
// const fulfillment = require('./fulfillment')
module.exports = joi.alternatives().try(
  // fulfillment,
  // joi.array().items(fulfillment)
  joi.array().items(joi.number()),
  joi.array().items(joi.object().keys({
    id: joi.number()
  })),
  joi.object().keys({
    fulfillments: joi.array().items(joi.number())
  })
)
