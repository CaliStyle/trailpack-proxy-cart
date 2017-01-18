'use strict'
const joi = require('joi')

// TODO add schema
module.exports =  joi.object().keys({
  line_items: joi.array().items(joi.object()),
  client_details: joi.object(),
  ip: joi.string(),
  host: joi.string()
})
