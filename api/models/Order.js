/* eslint new-cap: [0] */
/* eslint no-console: [0] */
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
              models.Order.belongsTo(models.Cart, {
                as: 'cart_token'
              })
              models.Order.belongsTo(models.Customer, {
                // as: 'customer_id'
              })
              models.Order.hasMany(models.Discount, {
                as: 'discount_codes'
              })
              models.Order.hasMany(models.Fulfillment, {
                as: 'fulfillments'
              })
              models.Order.hasMany(models.Transaction, {
                as: 'transactions'
              })
              models.Order.hasOne(models.CustomerAddress, {
                as: 'billing_address'
              })
              models.Order.hasOne(models.CustomerAddress, {
                as: 'shipping_address'
              })
              models.Order.hasOne(models.Refund, {
                as: 'refunds'
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
        client_details: helpers.JSONB('order', app, Sequelize, 'client_details', {
          defaultValue: {
            'accept_language': null,
            'browser_height': null,
            'browser_ip': '0.0.0.0',
            'browser_width': null,
            'session_hash': null,
            'user_agent': null
          }
        }),
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
        note_attributes: helpers.JSONB('order', app, Sequelize, 'note_attributes', {
          defaultValue: {}
        }),
        number: {
          type: Sequelize.INTEGER
        },
        order_number: {
          type: Sequelize.STRING
        },
        payment_gateway_names: helpers.JSONB('order', app, Sequelize, 'payment_gateway_names', {
          defaultValue: {}
        }),
        processed_at: {
          type: Sequelize.DATE
        },
        referring_site: {
          type: Sequelize.STRING
        },
        // refunds: helpers.JSONB('order', app, Sequelize, 'refunds', {
        //   defaultValue: {}
        // }),
        // billing_address: helpers.JSONB('order', app, Sequelize, 'billing_address: ', {
        //   defaultValue: {}
        // }),
        // shipping_address: helpers.JSONB('order', app, Sequelize, 'shipping_address: ', {
        //   defaultValue: {}
        // }),
        shipping_lines: helpers.JSONB('order', app, Sequelize, 'shipping_lines: ', {
          defaultValue: {}
        }),
        source_name: {
          type: Sequelize.STRING
        },
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        tax_lines: helpers.JSONB('order', app, Sequelize, 'tax_lines', {
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
        order_status_url: {
          type: Sequelize.STRING
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
