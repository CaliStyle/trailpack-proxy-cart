'use strict'
const joi = require('joi')
const discountSchema = require('../discount/discount')
module.exports = joi.object().keys({
  id: joi.any(),
  handle: joi.string(),
  title: joi.string(),
  description: joi.string(),
  excerpt: joi.string(),
  body: joi.string(),
  primary_purpose: joi.string(),
  published: joi.boolean(),
  sort_order: joi.string(),
  tax_rate: joi.number(),
  tax_percentage: joi.number(),
  tax_type: joi.string(),
  tax_name: joi.string(),
  discount_name: joi.string(),
  discount_code: joi.string(),
  discount_type: joi.string(),
  discount_scope: joi.string(),
  discount_product_exclude: joi.array().items(joi.string()),
  discount_rate: joi.number(),
  discount_percentage: joi.number(),
  discount_status: joi.string(),
  discounts: joi.array().items(
    joi.alternatives().try(
      // Discount's id
      joi.number(),
      // Discount's code
      joi.string(),
      // New Discount
      discountSchema
    )
  ),
  collections: joi.array().items(
    joi.alternatives().try(
      // collection's id
      joi.number(),
      // collection's handle
      joi.string(),
      // New Collection
      joi.object()
    )
  ),
  images: joi.array().items(joi.object().keys({
    src: joi.string().required(),
    id: joi.any().optional(),
    position: joi.number().optional(),
    alt: joi.string().optional()
  }))
})
