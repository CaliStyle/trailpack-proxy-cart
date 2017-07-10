'use strict'
const joi = require('joi')
module.exports =  joi.object().keys({
  order_id: joi.number().optional(),
  name: joi.string().required(),
  price: joi.number().required()
})
