'use strict'
const joi = require('joi')
const variantSchema = require('./variant')
const imageSchema = require('./image')
const tagsSchema = require('../tags/tags')
const metadataSchema = require('../metadata/metadata')

module.exports = joi.object().keys({
  id: joi.any(),
  sku: joi.string(),
  host: joi.string(),
  handle: joi.string(),
  title: joi.string(),
  seo_title: joi.string(),
  body: joi.string(),
  seo_description: joi.string(),
  type: joi.string(),
  tags: tagsSchema,
  price: joi.number(),
  compare_at_price: joi.number(),
  currency: joi.string(),
  collections: joi.array(),
  fulfillment_service: joi.string(),
  metadata: metadataSchema,
  options: joi.array().items(joi.object()),
  published: joi.boolean(),
  published_scope: joi.string(),
  requires_shipping: joi.boolean(),
  requires_tax: joi.boolean(),
  requires_subscription: joi.boolean(),
  subscription_interval: joi.number(),
  subscription_unit: joi.string().valid('0','d','w','ww','m','mm','y','yy'),
  inventory_management: joi.boolean(),
  inventory_quantity: joi.number(),
  inventory_lead_time: joi.number(),
  images: joi.array().items(imageSchema),
  tax_code: joi.string(),
  weight: joi.number(),
  weight_unit: joi.string().valid('g', 'kg', 'oz', 'lb'),
  variants: joi.array().items(variantSchema),
  vendor: joi.string(),

  // Policy Arguments
  client_details: joi.object(),
  ip: joi.string(),
  shop_id: joi.number()
})
