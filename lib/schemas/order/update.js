'use strict'
const joi = require('joi')
const addressSchema = require('../address/address')

module.exports = joi.object().keys({
  buyer_accepts_marketing: joi.boolean(),
  shipping_address: addressSchema,
  billing_address: addressSchema,
  email: joi.string(),
  note: joi.string()
}).unknown()
