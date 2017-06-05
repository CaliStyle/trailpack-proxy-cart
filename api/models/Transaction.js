/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
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
          hooks: {
            afterCreate: (values, options, fn) => {
              app.services.TransactionService.afterCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            afterUpdate: (values, options, fn) => {
              app.services.TransactionService.afterUpdate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            }
          },
          classMethods: {
            TRANSACTION_ERRORS: TRANSACTION_ERRORS,
            TRANSACTION_STATUS: TRANSACTION_STATUS,
            TRANSACTION_KIND: TRANSACTION_KIND,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // models.Transaction.belongsTo(models.Refund, {
              //
              // })
              models.Transaction.belongsTo(models.Order, {
                // as: 'order_id',
                // allowNull: false
              })
              models.Transaction.belongsTo(models.Customer, {
                // as: 'customer_id',
                // allowNull: true
              })
            },
            resolve: function(transaction, options){
              const Transaction =  this
              if (transaction instanceof Transaction.Instance){
                return Promise.resolve(transaction)
              }
              else if (transaction && _.isObject(transaction) && transaction.id) {
                return Transaction.findById(transaction.id, options)
                  .then(resTransaction => {
                    if (!resTransaction) {
                      throw new Errors.FoundError(Error(`Transaction ${transaction.id} not found`))
                    }
                    return resTransaction
                  })
              }
              else if (transaction && (_.isString(transaction) || _.isNumber(transaction))) {
                return Transaction.findById(transaction, options)
                  .then(resTransaction => {
                    if (!resTransaction) {
                      throw new Errors.FoundError(Error(`Transaction ${transaction} not found`))
                    }
                    return resTransaction
                  })
              }
              else {
                const err = new Error('Unable to resolve Transaction')
                Promise.reject(err)
              }
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
        customer_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Customer',
          //   key: 'id'
          // },
          allowNull: true
        },
        order_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Order',
          //   key: 'id'
          // },
          allowNull: false
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
        // The amount of money that the transaction was for.
        amount: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The authorization code associated with the transaction.
        authorization: {
          type: Sequelize.STRING
        },
        // The date the authorization expires
        authorization_exp: {
          type: Sequelize.DATE,
          defaultValue: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
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
        // An object containing information about the credit card used for this transaction. Normally It has the following properties:
        // type: The type of Source: credit_card, debit_card, prepaid_card, apple_pay, bitcoin
        // gateway: the Gateway used
        // avs_result_code: The Response code from AVS the address verification system. The code is a single letter; see this chart for the codes and their definitions.
        // credit_card_iin: The issuer identification number (IIN), formerly known as bank identification number (BIN) ] of the customer's credit card. This is made up of the first few digits of the credit card number.
        // credit_card_company: The name of the company who issued the customer's credit card.
        // credit_card_number: The customer's credit card number, with most of the leading digits redacted with Xs.
        // cvv_result_code: The Response code from the credit card company indicating whether the customer entered the card security code, a.k.a. card verification value, correctly. The code is a single letter or empty string; see this chart http://www.emsecommerce.net/avs_cvv2_response_codes.htm for the codes and their definitions.
        // token: The card token from the Gateway
        payment_details: helpers.JSONB('Transaction', app, Sequelize, 'payment_details', {
          defaultValue: {}
        }),
        // The kind of transaction:
        kind: {
          type: Sequelize.ENUM,
          values: _.values(TRANSACTION_KIND)
        },
        // A transaction reciept attached to the transaction by the gateway. The value of this field will vary depending on which gateway the shop is using.
        receipt: helpers.JSONB('Transaction', app, Sequelize, 'receipt', {
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
          values: _.values(TRANSACTION_STATUS),
          defaultValue: TRANSACTION_STATUS.PENDING
        },
        // The three letter code (ISO 4217) for the currency used for the payment.
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
        },
        // A description of the Transaction
        description: {
          type: Sequelize.STRING
        },
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
