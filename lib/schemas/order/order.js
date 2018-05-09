'use strict'
const joi = require('joi')
const addressSchema = require('../address/address')

module.exports = joi.object().keys({
  customer_token: joi.string(),
  customer_id: joi.number(),
  customer: joi.alternatives().try(
    joi.number(),
    joi.string(),
    joi.object().keys({
      id: joi.number(),
      token: joi.string()
    }).unknown()
  ),
  client_details: joi.object(),
  ip: joi.string(),
  buyer_accepts_marketing: joi.boolean(),
  shipping_address: addressSchema,
  billing_address: addressSchema,
  processing_method: joi.string(),
  cart_token: joi.string(),
  cart_id: joi.number(),
  cart: joi.alternatives().try(
    joi.number(),
    joi.string(),
    joi.object().keys({
      id: joi.number(),
      token: joi.string()
    }).unknown()
  ),
  subscription_token: joi.string(),
  subscription: joi.alternatives().try(
    joi.number(),
    joi.string(),
    joi.object().keys({
      id: joi.number(),
      token: joi.string()
    }).unknown()
  ),
  currency: joi.string(),
  email: joi.string(),
  tags: joi.array().items(joi.string()),
  payment_kind: joi.string().valid(['manual', 'immediate']),
  transaction_kind: joi.string().valid(['authorize', 'sale']),
  fulfillment_service: joi.string(),
  fulfillment_kind: joi.string().valid(['manual', 'immediate']),
  // Only Gateway Tokens, or Account Source are allowed for PCI compliance
  payment_details: joi.array().items(joi.object().keys({
    gateway: joi.string().required(),
    token: joi.string(),
    source: joi.alternatives().try(
      joi.number(),
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
