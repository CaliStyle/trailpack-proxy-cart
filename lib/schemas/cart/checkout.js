'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  shop_id: joi.any(),
  ip: joi.string(),
  // TODO finish client_details
  client_details: joi.object(),
  // TODO finish cart
  cart: joi.object(),
  // TODO finish source
  source: joi.object(),
  payment_kind: joi.string().valid(['manual', 'authorize', 'sale'])

})
