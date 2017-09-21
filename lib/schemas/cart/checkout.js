'use strict'
const joi = require('joi')
const addressSchema = require('../address/address')

module.exports =  joi.object().keys({
  shop: joi.object(),
  shop_id: joi.number(),
  ip: joi.string(),
  client_details: joi.object(),
  cart_token: joi.string(),
  cart: joi.object().keys({
    id: joi.number()
  }).unknown(),
  customer: joi.object().keys({
    id: joi.number()
  }).unknown(),
  email: joi.string(),
  first_name: joi.string(),
  last_name: joi.string(),
  shipping_address: addressSchema,
  billing_address: addressSchema,
  // Only Gateway Tokens, or Account Source are allowed for PCI compliance
  payment_details: joi.array().items(joi.object().keys({
    gateway: joi.string().required(),
    token: joi.string(),
    source: joi.alternatives().try(
      joi.string(),
      joi.object().keys({
        id: joi.any(),
        gateway: joi.string().required(),
        foreign_id: joi.any(),
        foreign_key: joi.any()
      }).unknown()
    ),
    amount: joi.number()
  }).unknown()),
  payment_kind: joi.string().valid(['manual', 'immediate']),
  transaction_kind: joi.string().valid(['authorize', 'sale']),
  fulfillment_kind: joi.string().valid(['immediate','manual'])
}).unknown()
