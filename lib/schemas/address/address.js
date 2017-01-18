'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  address_1: joi.string(),
  address_2: [joi.string().allow('').optional(), joi.allow(null)],
  address_3: [joi.string().allow('').optional(), joi.allow(null)],
  company: [joi.string().allow('').optional(), joi.allow(null)],
  city: joi.string(),
  prefix: [joi.string().allow('').optional(), joi.allow(null)],
  first_name: [joi.string().allow('').optional(), joi.allow(null)],
  last_name: [joi.string().allow('').optional(), joi.allow(null)],
  suffix: [joi.string().allow('').optional(), joi.allow(null)],
  phone: [joi.string().allow('').optional(), joi.allow(null)],
  province: joi.string(),
  province_code: joi.string(),
  country: joi.string(),
  country_code: joi.string(),
  country_name: joi.string(),
  postal_code: joi.string()
}).unknown()
