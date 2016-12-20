'use strict'

const Model = require('trails/model')
const DISCOUNT_TYPES = require('../utils/enums').DISCOUNT_TYPES
const DISCOUNT_STATUS = require('../utils/enums').DISCOUNT_STATUS
const _ = require('lodash')
/**
 * @module Discount
 * @description Discount Model
 */
module.exports = class Discount extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            DISCOUNT_TYPES: DISCOUNT_TYPES,
            DISCOUNT_STATUS: DISCOUNT_STATUS
            /**
             * Associate the Model
             * @param models
             */
            // associate: (models) => {
            //   models.Cart.hasMany(models.Product, {
            //     as: 'products'
            //   })
            // }
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
        discount_type: {
          type: Sequelize.ENUM,
          values: _.values(DISCOUNT_TYPES),
          defaultValue: DISCOUNT_TYPES.FIXED_AMOUNT
        },
        value: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        code: {
          type: Sequelize.STRING
        },
        ends_at: {
          type: Sequelize.DATE
        },
        starts_at: {
          type: Sequelize.DATE
        },
        status: {
          type: Sequelize.ENUM,
          values: _.values(DISCOUNT_STATUS),
          defaultValue: DISCOUNT_STATUS.ENABLED
        },
        minimum_order_amount: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        usage_limit: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        applies_to_resource: {
          type: Sequelize.STRING
        },
        applies_to_id: {
          type: Sequelize.STRING
        },
        applies_once: {
          type: Sequelize.BOOLEAN
        },
        applies_once_per_customer: {
          type: Sequelize.BOOLEAN
        },
        times_used: {
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
