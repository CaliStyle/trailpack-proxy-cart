'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  // The Nexus of the operation
  nexus: joi.object().keys({
    name: joi.string().required(),
    email: joi.string().required(),
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
  // The type of the payment
  order_payment_kind: joi.string().valid(['manual', 'authorize', 'sale']),
  // The type of fulfillment
  order_fulfillment_kind: joi.string().valid(['manual', 'immediate']),
  // On a refund to restock a product
  refund_restock: joi.boolean(),
  // Allow
  allow: joi.object().keys({
    destroy_product: joi.boolean(),
    destroy_variant: joi.boolean()
  }),
  // Countries to load on start
  default_countries: joi.array().items(joi.string()),
  // Subscriptions
  subscriptions: joi.object().keys({
    // The amount of times a Subscription will retry failed transactions
    retry_attempts: joi.number(),
    // The amount of days before a Subscription will cancel from failed transactions
    grace_period_days: joi.number()
  }),
  // Orders
  orders: joi.object().keys({
    // The amount of times a Order will retry failed transactions
    retry_attempts: joi.number(),
    // The amount of days before a Order will cancel from failed transactions
    grace_period_days: joi.number()
  }),
  // After Create hooks
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
  // After Update hooks
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
