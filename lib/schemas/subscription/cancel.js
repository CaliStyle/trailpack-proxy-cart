'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  id: joi.string(),
  reason: joi.string().valid('customer','fraud','inventory','other')
})
