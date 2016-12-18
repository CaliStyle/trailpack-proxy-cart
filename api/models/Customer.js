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
        accepts_marketing: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        addresses: helpers.ARRAY('customer', app, Sequelize, Sequelize.STRING, 'addresses', {
          defaultValue: []
        }),
        default_address: helpers.JSONB('customer', app, Sequelize, 'default_address', {
          defaultValue: {}
        }),
        first_name: {
          type: Sequelize.STRING
        },
        last_name: {
          type: Sequelize.STRING
        },
        metadata: helpers.JSONB('customer', app, Sequelize, 'metadata', {
          defaultValue: {}
        }),
        note: {
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
        }
      }
    }
    return schema
  }
}
