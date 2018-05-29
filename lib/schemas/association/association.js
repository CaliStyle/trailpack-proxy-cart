'use strict'
const joi = require('joi')

module.exports = joi.object().keys({
  product_id: joi.any(),
  handle: joi.string(),
  variant_id: joi.any(),
  position: joi.number()
})
