'use strict'
const joi = require('joi')
module.exports =  joi.object().keys({
  product_id: joi.number(),
  variant_id: joi.number(),
  product_variant_id: joi.number(),
  quantity: joi.number(),
  properties: joi.array().items(joi.object().keys({
    name: joi.string().required(),
    value: joi.string()
  })).optional(),
  fulfillment_extras: joi.object().keys({
    include_return_label: joi.boolean(),
    insurance: joi.object().keys({
      amount: joi.number(),
      currency: joi.string(),
      provider: joi.string(),
      content: joi.string()
    }),
    alcohol: joi.object().keys({
      contains_alcohol: joi.boolean(),
      recipient_type: joi.string()
    }),
    dry_ice: joi.object().keys({
      contains_dry_ice: joi.boolean(),
      weight: joi.number()
    })
  })
})
