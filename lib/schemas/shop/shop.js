'use strict'
const joi = require('joi')
const addressSchema = require('../address/address')

module.exports = joi.object().keys({
  address: addressSchema,
  currency: joi.string(),
  host: joi.string(),
  name: joi.string(),
  phone: joi.string(),
  primary_locale: joi.string(),
  email: joi.string(),
  money_format: joi.string(),
  money_with_currency_format: joi.string(),
  tax_shipping: joi.string(),
  taxes_included: joi.string(),
  county_taxes: joi.string(),
  timezone: joi.string(),
  iana_timezone: joi.string(),
  weight_unit: joi.string()
})
