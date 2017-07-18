'use strict'
const joi = require('joi')
module.exports =  joi.object().keys({
  order_id: joi.number().optional(),
  fulfillment_id: joi.number().optional(),
  status: joi.string(),
  status_url: joi.string(),
  tracking_company: joi.string(),
  tracking_number: joi.string(),
})
