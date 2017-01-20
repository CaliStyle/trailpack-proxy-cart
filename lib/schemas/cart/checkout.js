'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  shop_id: joi.number(),
  ip: joi.string(),
  client_details: joi.object(),
  cart: joi.object().keys({
    id: joi.number()
  }),
  // Only Gateway and Tokens are allowed for PCI compliance
  payment_details: joi.array().items(joi.object().keys({
    gateway: joi.string().required(),
    token: joi.string()
  }).unknown()),
  payment_kind: joi.string().valid(['manual', 'authorize', 'sale']),
  fulfillment_kind: joi.string().valid(['immediate','manual'])
})
