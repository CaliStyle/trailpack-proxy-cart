'use strict'
const joi = require('joi')
const itemSchema = require('./lineItem')
const addressSchema = require('../address/address')
module.exports =  joi.object().keys({
  line_items: joi.array().items(itemSchema),
  customer_id: joi.number(),
  client_details: joi.object(),
  ip: joi.string(),
  host: joi.string(),
  shop_id: joi.number(),
  shipping_address: addressSchema,
  billing_address: addressSchema,
  notes: joi.string()
}).unknown()
