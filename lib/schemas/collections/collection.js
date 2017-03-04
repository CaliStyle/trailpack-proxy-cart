'use strict'
const joi = require('joi')
module.exports = joi.object().keys({
  id: joi.any(),
  handle: joi.string(),
  title: joi.string(),
  body: joi.string(),
  primary_purpose: joi.string(),
  published: joi.boolean(),
  sort_order: joi.string(),
  tax_rate: joi.number(),
  tax_percentage: joi.number(),
  tax_type: joi.string(),
  tax_name: joi.string()
})
