'use strict'
const joi = require('joi')
module.exports =  joi.object().keys({
  id: joi.number(),
  order_id: joi.number().optional(),
  status: joi.string().optional(),
  status_url: joi.string().optional(),
  tracking_company: joi.string().optional(),
  tracking_number: joi.string().optional(),
  receipt: joi.object().optional()
}).unknown()
