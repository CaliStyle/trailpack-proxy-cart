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
        // The amount of money that the transaction was for.
        amount: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The authorization code associated with the transaction.
        authorization: {
          type: Sequelize.STRING
        },
        // The unique identifier for the device.
        device_id: {
          type: Sequelize.STRING
        },
        // The name of the gateway the transaction was issued through
        gateway: {
          type: Sequelize.STRING
        },
        // The origin of the transaction.
        source_name: {
          type: Sequelize.STRING,
          defaultValue: 'web'
        },
        // An object containing information about the credit card used for this transaction. It has the following properties:
        payment_details: helpers.ARRAY('transaction', app, Sequelize, Sequelize.STRING, 'payment_details', {
          defaultValue: []
        }),
        // The kind of transaction:
        kind: {
          type: Sequelize.ENUM,
          values: _.values(TRANSACTION_KIND)
        },
        // A transaction reciept attached to the transaction by the gateway. The value of this field will vary depending on which gateway the shop is using.
        receipt: helpers.JSONB('transaction', app, Sequelize, 'receipt', {
          defaultValue: {}
        }),
        // A standardized error code, independent of the payment provider. Value can be null.
        error_code: {
          type: Sequelize.ENUM,
          values: _.values(TRANSACTION_ERRORS)
        },
        // The status of the transaction. Valid values are: pending, failure, success or error.
        status: {
          type: Sequelize.ENUM,
          values: _.values(TRANSACTION_STATUS)
        },
        // The three letter code (ISO 4217) for the currency used for the payment.
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
        },
        // TODO Enable User
        // The unique identifier for the user.
        // user_id: {
        //   type: Sequelize.INTEGER,
        //   references: {
        //     model: 'User',
        //     key: 'id'
        //   }
        // },
        // Live Mode
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyEngine.live_mode
        }
      }
    }
    return schema
  }
}
