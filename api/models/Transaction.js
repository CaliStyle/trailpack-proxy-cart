/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const TRANSACTION_ERRORS = require('../utils/enums').TRANSACTION_ERRORS
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const TRANSACTION_KIND = require('../utils/enums').TRANSACTION_KIND
const _ = require('lodash')

/**
 * @module Transaction
 * @description Transaction Model
 */
module.exports = class Transaction extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            TRANSACTION_ERRORS: TRANSACTION_ERRORS,
            TRANSACTION_STATUS: TRANSACTION_STATUS,
            TRANSACTION_KIND: TRANSACTION_KIND,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Transaction.belongsTo(models.Order, {
                // as: 'order_id'
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
        amount: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        authorization: {
          type: Sequelize.STRING
        },
        device_id: {
          type: Sequelize.STRING
        },
        gateway: {
          type: Sequelize.STRING
        },
        source_name: {
          type: Sequelize.STRING,
          defaultValue: 'web'
        },
        payment_details: helpers.JSONB('transaction', app, Sequelize, 'payment_details', {
          defaultValue: {}
        }),
        kind: {
          type: Sequelize.ENUM,
          values: _.values(TRANSACTION_KIND)
        },
        receipt: helpers.JSONB('transaction', app, Sequelize, 'receipt', {
          defaultValue: {}
        }),
        error_code: {
          type: Sequelize.ENUM,
          values: _.values(TRANSACTION_ERRORS)
        },
        status: {
          type: Sequelize.ENUM,
          values: _.values(TRANSACTION_STATUS)
        },
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
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
