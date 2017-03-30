'use strict'
const joi = require('joi')

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
  // Only Gateway and Tokens are allowed for PCI compliance
  payment_details: joi.array().items(joi.object().keys({
    gateway: joi.string().required(),
    token: joi.string().required(),
    amount: joi.number()
  }).unknown()),
  payment_kind: joi.string().valid(['manual', 'authorize', 'sale']),
  fulfillment_kind: joi.string().valid(['immediate','manual'])
}).unknown()
