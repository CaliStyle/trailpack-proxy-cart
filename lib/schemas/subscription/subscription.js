'use strict'
const joi = require('joi')
const itemSchema = require('./line_item')
module.exports =  joi.object().keys({
  line_items: joi.array().items(itemSchema),
  client_details: joi.object(),
  ip: joi.string(),
  host: joi.string()
})
