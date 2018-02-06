'use strict'
const joi = require('joi')
const variantSchema = require('./variant')
const imageSchema = require('./image')
const tagsSchema = require('../tag/tags')
const metadataSchema = require('../metadata/metadata')
const associationsSchema = require('../association/associations')

module.exports = joi.object().keys({
  id: joi.any(),
  sku: joi.string(),
  option: joi.object(),
  property_pricing: joi.object().keys({
    name: joi.string().required(),
    group: joi.string(),
    price: joi.number().required(),
    image: joi.string()
  }),
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
  associations: associationsSchema,
  fulfillment_service: joi.string(),
  metadata: metadataSchema,
  published: joi.boolean(),
  published_scope: joi.string(),
  available: joi.boolean(),
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
  vendors: joi.array().items(joi.string()),
  average_shipping: joi.number(), // 'Average Shipping',
  google: joi.object().keys({
    g_product_category: joi.string(), //' Google Shopping / Google Product Category',
    g_gender: joi.string(), // 'Google Shopping / Gender',
    g_age_group: joi.string(), // 'Google Shopping / Age Group',
    g_mpn: joi.string(), // 'Google Shopping / MPN',
    g_adwords_grouping: joi.string(), // 'Google Shopping / Adwords Grouping',
    g_adwords_label: joi.string(), // 'Google Shopping / Adwords Labels',
    g_condition: joi.string(), // 'Google Shopping / Condition',
    g_custom_product: joi.string(), // 'Google Shopping / Custom Product',
    g_custom_label_0: joi.string(), // 'Google Shopping / Custom Label 0',
    g_custom_label_1: joi.string(), // 'Google Shopping / Custom Label 1',
    g_custom_label_2: joi.string(), // 'Google Shopping / Custom Label 2',
    g_custom_label_3: joi.string(), // 'Google Shopping / Custom Label 3',
    g_custom_label_4: joi.string(), // 'Google Shopping / Custom Label 4'
  }),
  amazon: joi.object(),

  // Policy Arguments
  client_details: joi.object(),
  ip: joi.string(),
  shop_id: joi.number()
})
