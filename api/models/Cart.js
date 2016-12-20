/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('../utils/helpers')
const _ = require('lodash')

/**
 * @module Cart
 * @description Cart Model
 */
module.exports = class Cart extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          hooks: {
            beforeUpdate: (values, options, fn) => {
              if (values.line_items) {
                let subtotalPrice = 0
                let totalDiscounts = 0
                let totalTax = 0
                let totalWeight = 0
                let totalPrice = 0
                let totalLineItemsPrice = 0
                const taxLines = {}
                const shippingLines = {}

                _.each(values.line_items, item => {
                  if (item.requires_tax) {
                    taxLines[item.id] = item.price * item.quantity
                  }
                  if (item.requires_shipping) {
                    shippingLines[item.id] = app.services.ProxyCartService.resolveConversion(item.weight, item.weight_unit)
                    totalWeight = totalWeight + shippingLines[item.id]
                  }
                  totalLineItemsPrice = totalLineItemsPrice + item.price * item.quantity

                  if (item.name !== 'shipping' && item.name !== 'tax') {
                    subtotalPrice = subtotalPrice + item.price * item.quantity
                  }
                  if (item.has_discount) {
                    totalDiscounts = totalDiscounts + item.discount
                  }
                })
                totalPrice = totalTax + subtotalPrice - totalDiscounts
                values.tax_lines = taxLines
                values.shipping_lines = shippingLines
                values.subtotal_price = subtotalPrice
                values.total_discounts = totalDiscounts
                values.total_tax = totalTax
                values.total_weight = totalWeight
                values.total_line_items_price = totalLineItemsPrice
                values.total_price = totalPrice
              }
              fn(null, values)
            }
          },
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Cart.belongsTo(models.Customer, {
                // as: 'customer_id'
              })
              models.Cart.hasMany(models.Product, {
                as: 'products'
                // constraints: false
              })
              models.Cart.hasMany(models.ProductVariant, {
                as: 'variants'
                // constraints: false
              })
              models.Cart.hasMany(models.Discount, {
                as: 'discounts'
                // constraints: false
              })
              models.Cart.hasMany(models.Coupon, {
                as: 'coupons'
                // constraints: false
              })
              models.Cart.hasMany(models.GiftCard, {
                as: 'gift_cards'
                // constraints: false
              })
            }
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        line_items: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'line_items', {
          defaultValue: []
        }),
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        shipping_lines: helpers.JSONB('cart', app, Sequelize, 'shipping_lines', {
          defaultValue: {}
        }),
        tax_lines: helpers.JSONB('cart', app, Sequelize, 'tax_lines', {
          defaultValue: {}
        }),
        taxes_included: {
          type: Sequelize.BOOLEAN
        },
        total_discounts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_line_items_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_tax: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_weight: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },

        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
