'use strict'
const joi = require('joi')
const _ = require('lodash')
const DISCOUNT_TYPES = require('../../enums').DISCOUNT_TYPES
module.exports = joi.object().keys({
  name: joi.string(),
  description: joi.string(),
  code: joi.string(),
  discount_type: joi.string().allow().valid(_.values(DISCOUNT_TYPES)),
  discount_rate: joi.number(),
  discount_percentage: joi.number(),
  discount_shipping: joi.number(),
  ends_at: joi.string(),
  starts_at: joi.string(),
  status: joi.string(),
  minimum_order_amount: joi.number(),
  usage_limit: joi.number(),
  applies_to_id: joi.number(),
  applies_to_model: joi.string(),
  applies_once: joi.boolean(),
  applies_once_per_customer: joi.number(),
  applies_compound: joi.boolean(),
  times_used: joi.number()
}).unknown()
