'use strict'
const joi = require('joi')

// TODO add schema
module.exports =  joi.object().keys({
  client_details: joi.object(),
  ip: joi.string(),
  host: joi.string()
})
