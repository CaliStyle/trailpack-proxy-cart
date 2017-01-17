'use strict'
const joi = require('joi')
const addressSchema = require('../address/address')

module.exports = joi.object().keys({
  // processing_method: joi.string(), //TODO restrict
  // cart_token: joi.string(),
  // currency: joi.string(),
  // client_details: joi.object(),
  // ip: joi.string(),
  buyer_accepts_marketing: joi.boolean(),
  shipping_address: addressSchema,
  billing_address: addressSchema
})
