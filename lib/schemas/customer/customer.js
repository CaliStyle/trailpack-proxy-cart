'use strict'
const joi = require('joi')
const addressSchema = require('./address')
const cartSchema = require('../cart/cart')

module.exports = joi.object().keys({
  accepts_marketing: joi.boolean(),
  first_name: joi.string(),
  last_name: joi.string(),
  note: joi.string(),
  cart: joi.any(),
  default_cart: cartSchema,
  shipping_address: addressSchema,
  billing_address: addressSchema
})
