'use strict'
const joi = require('joi')
module.exports =  joi.object().keys({
  id: joi.any(),
  attachment: joi.string(), // Buffer
  src: joi.string(),
  alt: joi.string(),
  position: joi.number()
})
