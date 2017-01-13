'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  order_payment: joi.string().valid(['manual', 'authorize', 'sale']),
  // TODO complete schema
  allow: joi.object(),
  subscribers: joi.array().items(joi.object().keys({
    name: joi.string(),
    type: joi.string(),
    fn: joi.any() // TODO check if function
  }))
})
