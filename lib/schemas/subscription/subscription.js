'use strict'
const joi = require('joi')
const itemSchema = require('./line_item')
module.exports =  joi.object().keys({
  id: joi.number(),
  token: joi.string(),
  line_items: joi.array().items(itemSchema),
  client_details: joi.object(),
  ip: joi.string(),
  host: joi.string(),
  renewed_at: joi.string(),
  active: joi.boolean(),
  interval: joi.number(),
  unit: joi.string().valid('0','d','w','ww','m','mm','y','yy')
})
