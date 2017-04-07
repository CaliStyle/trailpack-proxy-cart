'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  nexus: joi.object().keys({
    name: joi.string().required(),
    host: joi.string().required(),
    address: joi.object().keys({
      address_1: joi.string(),
      address_2: [joi.string().allow('').optional(), joi.allow(null)],
      address_3: [joi.string().allow('').optional(), joi.allow(null)],
      company: [joi.string().allow('').optional(), joi.allow(null)],
      city: joi.string(),
      phone: [joi.string().allow('').optional(), joi.allow(null)],
      province: joi.string(),
      province_code: joi.string(),
      country: joi.string(),
      country_code: joi.string(),
      country_name: joi.string(),
      postal_code: joi.string()
    })
  }),
  order_payment_kind: joi.string().valid(['manual', 'authorize', 'sale']),
  order_fulfillment_kind: joi.string().valid(['manual', 'immediate']),
  refund_restock: joi.boolean(),
  allow: joi.object().keys({
    destroy_product: joi.boolean(),
    destroy_variant: joi.boolean()
  }),
  afterCreate: joi.object().keys({
    customer: joi.alternatives().try(
      joi.func(),
      joi.object({
        arg: joi.string(),
        value: joi.func()
      }).unknown()
    ),
    order: joi.alternatives().try(
      joi.func(),
      joi.object({
        arg: joi.string(),
        value: joi.func()
      }).unknown()
    ),
    subscription: joi.alternatives().try(
      joi.func(),
      joi.object({
        arg: joi.string(),
        value: joi.func()
      }).unknown()
    ),
  }),
  afterUpdate: joi.object().keys({
    customer: joi.alternatives().try(
      joi.func(),
      joi.object({
        arg: joi.string(),
        value: joi.func()
      }).unknown()
    ),
    order: joi.alternatives().try(
      joi.func(),
      joi.object({
        arg: joi.string(),
        value: joi.func()
      }).unknown()
    ),
    subscription: joi.alternatives().try(
      joi.func(),
      joi.object({
        arg: joi.string(),
        value: joi.func()
      }).unknown()
    ),
  })
})
