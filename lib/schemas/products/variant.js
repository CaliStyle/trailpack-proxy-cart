'use strict'
const joi = require('joi')
const imageSchema = require('./image')

module.exports =  joi.object().keys({
  id: joi.any(),
  sku: joi.string(),
  title: joi.string(),
  price: joi.number(),
  product_id: joi.number(),
  compare_at_price: joi.number(),
  currency: joi.string(),
  collection: joi.any(),
  fulfillment_service: joi.string(),
  option: joi.object(),
  published: joi.boolean(),
  published_scope: joi.string(),
  requires_shipping: joi.boolean(),
  requires_tax: joi.boolean(),
  requires_subscription: joi.boolean(),
  subscription_interval: joi.number(),
  subscription_unit: joi.string().valid('0','d','w','ww','m','mm','y','yy'),
  inventory_management: joi.boolean(),
  inventory_quantity: joi.number(),
  images: joi.array().items(imageSchema),
  tax_code: joi.string(),
  weight: joi.number(),
  weight_unit: joi.string().valid('g', 'kg', 'oz', 'lb')
})
