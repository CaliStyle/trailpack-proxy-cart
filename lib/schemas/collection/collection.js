'use strict'
const joi = require('joi')
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
  discount_type: joi.string(),
  discount_scope: joi.string(),
  discount_product_exclude: joi.array().items(joi.string()),
  discount_rate: joi.number(),
  discount_percentage: joi.number(),
  collections: joi.array(),
  images: joi.array().items(joi.object().keys({
    src: joi.string().required(),
    id: joi.any().optional(),
    position: joi.number().optional(),
    alt: joi.string().optional()
  }))
})
