'use strict'
const joi = require('joi')
const addressSchema = require('../address/address')

module.exports = joi.object().keys({
  client_details: joi.object(),
  ip: joi.string(),
  buyer_accepts_marketing: joi.boolean(),
  shipping_address: addressSchema,
  billing_address: addressSchema,
  processing_method: joi.string(),
  cart_token: joi.string(),
  currency: joi.string(),
  email: joi.string(),
  payment_details: joi.array().items(joi.object().keys({
    gateway: joi.string().required(),
    token: joi.string()
  }).unknown())
})
