'use strict'
const joi = require('joi')
const addressSchema = require('./address')
const cartSchema = require('../cart/cart')
const tagsSchema = require('../tags/tags')
const metadataSchema = require('../metadata/metadata')
module.exports = joi.object().keys({
  accepts_marketing: joi.boolean(),
  first_name: joi.string(),
  last_name: joi.string(),
  note: joi.string(),
  cart: joi.any(),
  default_cart: cartSchema,
  default_address: addressSchema,
  shipping_address: addressSchema,
  billing_address: addressSchema,
  metadata: metadataSchema,
  tags: tagsSchema,
  client_details: joi.object(),
  ip: joi.string()
})
