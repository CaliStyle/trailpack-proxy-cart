'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  address_1: joi.string(),
  address_2: joi.string().allow('').optional(),
  address_3: joi.string().allow('').optional(),
  company: joi.string().allow('').optional(),
  city: joi.string(),
  prefix: joi.string().allow('').optional(),
  first_name: joi.string(),
  last_name: joi.string(),
  suffix: joi.string().allow('').optional(),
  phone: joi.string().allow('').optional(),
  province: joi.string(),
  province_code: joi.string(),
  country: joi.string(),
  country_code: joi.string(),
  country_name: joi.string(),
  postal_code: joi.string()
})
