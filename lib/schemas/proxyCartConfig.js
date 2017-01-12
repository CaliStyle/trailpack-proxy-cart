'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  order_payment: joi.string().valid(['manual', 'authorize', 'sale'])
})
