'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  handle: joi.string().required(),
  title: joi.string().required(),
  body: joi.string(),
  type: joi.string().required(),
  images: joi.array().items(joi.object().keys({
    src: joi.string(),
    alt: joi.string()
  })),
  vendor: joi.string()
})
