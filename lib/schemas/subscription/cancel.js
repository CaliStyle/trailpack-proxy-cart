'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  id: joi.any(),
  reason: joi.string().valid('customer','fraud','inventory','other')
})
