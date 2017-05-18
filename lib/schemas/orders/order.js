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
  cart: joi.object(),
  subscription_token: joi.string(),
  subscription: joi.object(),
  currency: joi.string(),
  email: joi.string(),
  tags: joi.array().items(joi.string()),
  // Only Gateway Tokens, or Account Source are allowed for PCI compliance
  payment_details: joi.array().items(joi.object().keys({
    gateway: joi.string().required(),
    token: joi.string(),
    source: joi.alternatives().try(
      joi.string(),
      joi.object().keys({
        id: joi.string(),
        gateway: joi.string().required(),
        foreign_id: joi.any(),
        foreign_key: joi.any()
      }).unknown()
    ),
    amount: joi.number()
  }).unknown())
})
