'use strict'
const joi = require('joi')
module.exports =  joi.object().keys({
  name: joi.string(),
  price: joi.number()
})
