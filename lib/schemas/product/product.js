'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  id: joi.any(),
  host: joi.string(),
  handle: joi.string(),
  title: joi.string(),
  body: joi.string(),
  type: joi.string(),
  tags: joi.array().items(joi.string()),
  price: joi.number(),
  compare_at_price: joi.number(),
  currency: joi.string(),
  fulfillment_service: joi.string(),
  metadata: joi.object(),
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
  images: joi.array().items(joi.object().keys({
    id: joi.any(),
    attachment: joi.string(), // Buffer
    src: joi.string(),
    alt: joi.string()
  })),
  weight: joi.number(),
  weight_unit: joi.string().valid('g', 'kg', 'oz', 'lb'),
  variants: joi.array().items(joi.object()),
  vendor: joi.string()
})
