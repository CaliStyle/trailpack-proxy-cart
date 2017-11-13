'use strict'
const joi = require('joi')
const _ = require('lodash')
const DISCOUNT_TYPES = require('../../enums').DISCOUNT_TYPES
const DISCOUNT_SCOPE = require('../../enums').DISCOUNT_SCOPE
module.exports = joi.object().keys({
  name: joi.string(),
  description: joi.string(),
  code: joi.string(),
  discount_scope: joi.string().allow().valid(_.values(DISCOUNT_SCOPE)),
  discount_type: joi.string().allow().valid(_.values(DISCOUNT_TYPES)),
  discount_rate: joi.number(),
  discount_threshold: joi.number(),
  discount_percentage: joi.number(),
  discount_shipping: joi.number(),
  ends_at: joi.string().allow(null),
  starts_at: joi.string().allow(null),
  status: joi.string(),
  minimum_order_amount: joi.number(),
  usage_limit: joi.number(),
  applies_to: joi.array().items(joi.object().keys({
    id: joi.number().required(),
    model: joi.string().required()
  })),
  applies_to_id: joi.number(),
  applies_to_model: joi.string(),
  discount_product_include: joi.array().items(joi.string()),
  discount_product_exclude: joi.array().items(joi.string()),
  shipping_product_include: joi.array().items(joi.string()),
  shipping_product_exclude: joi.array().items(joi.string()),
  tax_product_include: joi.array().items(joi.string()),
  tax_product_exclude: joi.array().items(joi.string()),
  applies_once: joi.boolean(),
  applies_once_per_customer: joi.boolean(),
  applies_compound: joi.boolean(),
  times_used: joi.number()
}).unknown()
