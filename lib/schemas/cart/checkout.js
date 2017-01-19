'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  shop_id: joi.any(),
  ip: joi.string(),
  // TODO finish client_details
  client_details: joi.object(),
  // TODO finish cart
  cart: joi.object(),
  // Only Tokens are allowed for PCI compliance
  payment_details: joi.array().items(joi.object().keys({
    gateway: joi.string().required(),
    token: joi.string()
  }).unknown()),
  payment_kind: joi.string().valid(['manual', 'authorize', 'sale']),
  fulfillment_kind: joi.string().valid(['immediate','manual'])
})
