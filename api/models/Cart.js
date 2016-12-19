/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('../utils/helpers')

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
                as: 'products',
                constraints: false
              })
              models.Cart.hasMany(models.ProductVariant, {
                as: 'variants',
                constraints: false
              })
              models.Cart.hasMany(models.Discount, {
                as: 'discounts',
                constraints: false
              })
              models.Cart.hasMany(models.Coupon, {
                as: 'coupons',
                constraints: false
              })
              models.Cart.hasMany(models.GiftCard, {
                as: 'gift_cards',
                constraints: false
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
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
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
          defaultValue: false
        }
      }
    }
    return schema
  }
}
