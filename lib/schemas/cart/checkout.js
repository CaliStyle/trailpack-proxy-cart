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
    token: joi.string()
  })),
  gateway: joi.string(),
  payment_kind: joi.string().valid(['manual', 'authorize', 'sale'])
})
