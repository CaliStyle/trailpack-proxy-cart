'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  order_payment_kind: joi.string().valid(['manual', 'authorize', 'sale']),
  order_fulfillment_kind: joi.string().valid(['manual', 'immediate']),
  refund_restock: joi.boolean(),
  allow: joi.object().keys({
    destroy_product: joi.boolean(),
    destroy_variant: joi.boolean()
  })
})
