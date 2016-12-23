'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  orm: joi.string(),
  models: joi.object().keys({
    defaultStore: joi.string().required(),
    migrate: joi.string()
  }),
  stores: joi.object().keys({
    productUpload: joi.object().required()
  }).unknown()
})
