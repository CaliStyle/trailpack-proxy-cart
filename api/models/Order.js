'use strict'

const Model = require('trails/model')
const helpers = require('../utils/helpers')
const ORDER_CANCEL = require('../utils/enums').ORDER_CANCEL
const ORDER_FINANCIAL = require('../utils/enums').ORDER_FINANCIAL
const ORDER_FULFILLMENT = require('../utils/enums').ORDER_FULFILLMENT
const _ = require('lodash')
/**
 * @module Order
 * @description Order Model
 */
module.exports = class Order extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            ORDER_CANCEL: ORDER_CANCEL,
            ORDER_FINANCIAL: ORDER_FINANCIAL,
            ORDER_FULFILLMENT: ORDER_FULFILLMENT,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Order.hasOne(models.Cart, {
                as: 'cart_token'
              })
              models.Order.belongsTo(models.Customer, {
                // as: 'customer_id'
              })
              models.Order.hasMany(models.Discount, {
                as: 'discount_codes'
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
        browser_ip: {
          type: Sequelize.STRING
        },
        buyer_accepts_marketing: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        cancel_reason: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_CANCEL)
        },
        cancelled_at: {
          type: Sequelize.DATE
        },
        client_details: {

        },
        closed_at: {
          type: Sequelize.DATE
        },
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
        },
        email: {
          type: Sequelize.STRING
        },
        financial_status: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_FINANCIAL)
        },
        fulfillments: {

        },
        fulfillment_status: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_FULFILLMENT),
          defaultValue: ORDER_FULFILLMENT.NONE
        },
        tags: helpers.ARRAY('customer', app, Sequelize, Sequelize.STRING, 'tags', {
          defaultValue: []
        }),
        gateway: {
          type: Sequelize.STRING
        },
        landing_site: {
          type: Sequelize.STRING
        },
        name: {
          type: Sequelize.STRING
        },
        note: {
          type: Sequelize.STRING
        },
        note_attributes: {

        },
        number: {
          type: Sequelize.INTEGER
        },
        order_number: {
          type: Sequelize.STRING
        },
        payment_gateway_names: {

        },
        processed_at: {
          type: Sequelize.DATE
        },
        referring_site: {
          type: Sequelize.STRING
        },
        refunds: {

        },
        billing_address: {

        },
        shipping_address: {

        },
        shipping_lines: {

        },
        source_name: {

        },
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        tax_lines: {

        },
        taxes_included: {

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
        transaction: {
          type: Sequelize.STRING
        },
        order_status_url: {
          type: Sequelize.STRING
        }
      }
    }
    return schema
  }
}
