/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('../utils/helpers')
const CUSTOMER_STATE = require('../utils/enums').CUSTOMER_STATE
const _ = require('lodash')
/**
 * @module Customer
 * @description Customer Model
 */
module.exports = class Customer extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            CUSTOMER_STATE: CUSTOMER_STATE,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Customer.hasMany(models.CustomerAddress, {
                as: 'addresses'
              })
              models.Customer.hasOne(models.CustomerAddress, {
                as: 'default_address'
              })
              models.Customer.hasOne(models.Metadata, {
                as: 'metadata'
              })
              models.Customer.hasMany(models.Order, {
                as: 'orders'
              })
              models.Customer.hasOne(models.Order, {
                as: 'last_order_id'
              })
              models.Customer.hasMany(models.Cart, {
                as: 'carts'
              })
              models.Customer.hasOne(models.Cart, {
                as: 'default_cart'
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
        accepts_marketing: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        first_name: {
          type: Sequelize.STRING
        },
        last_name: {
          type: Sequelize.STRING
        },
        note: {
          type: Sequelize.STRING
        },
        last_order_name: {
          type: Sequelize.STRING
        },
        orders_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        state: {
          type: Sequelize.ENUM,
          values: _.values(CUSTOMER_STATE),
          defaultValue: CUSTOMER_STATE.ENABLED
        },
        tags: helpers.ARRAY('customer', app, Sequelize, Sequelize.STRING, 'tags', {
          defaultValue: []
        }),
        tax_exempt: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        total_spent: {
          type: Sequelize.INTEGER
        },
        verified_email: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
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
