'use strict'
const joi = require('joi')
module.exports =  joi.object().keys({
  id: joi.number(),
  order_id: joi.number().optional(),
  status: joi.string().optional(),
  status_url: joi.string().allow(null).optional(),
  tracking_company: joi.string().allow(null).optional(),
  tracking_number: joi.string().allow(null).optional(),
  receipt: joi.object().allow(null).optional()
}).unknown()
