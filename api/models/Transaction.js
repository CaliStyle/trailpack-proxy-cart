/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
const shortId = require('shortid')
const TRANSACTION_ERRORS = require('../../lib').Enums.TRANSACTION_ERRORS
const TRANSACTION_STATUS = require('../../lib').Enums.TRANSACTION_STATUS
const TRANSACTION_KIND = require('../../lib').Enums.TRANSACTION_KIND
const TRANSACTION_DEFAULTS = require('../../lib').Enums.TRANSACTION_DEFAUTLS
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
          // defaultScope: {
          //   where: {
          //     live_mode: app.config.proxyEngine.live_mode
          //   }
          // },
          scopes: {
            live: {
              where: {
                live_mode: true
              }
            },
            authorized: {
              where: {
                kind: 'authorize',
                status: 'success'
              }
            },
            captured: {
              where: {
                kind: ['capture','sale'],
                status: 'success'
              }
            },
            voided: {
              where: {
                kind: 'void',
                status: 'success'
              }
            },
            refunded: {
              where: {
                kind: 'refund',
                status: 'success'
              }
            }
          },
          hooks: {
            beforeCreate: (values, options, fn) => {
              if (!values.token) {
                values.token = `transaction_${shortId.generate()}`
              }
              fn()
            },
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
            TRANSACTION_DEFAULTS: TRANSACTION_DEFAULTS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // models.Transaction.belongsTo(models.Refund, {
              //
              // })
              models.Transaction.belongsTo(models.Order, {
                // as: 'Order',
                // allowNull: false
              })
              models.Transaction.belongsTo(models.Customer, {
                // as: 'Customer',
                // allowNull: true
              })
              models.Transaction.belongsTo(models.Source, {
                // as: 'Source',
                // allowNull: true
              })
            },
            /**
             *
             * @param options
             * @param batch
             * @returns Promise.<T>
             */
            batch: function (options, batch) {
              const self = this
              options = options || {}
              options.limit = options.limit || 10
              options.offset = options.offset || 0
              options.regressive = options.regressive || false

              const recursiveQuery = function(options) {
                let count = 0
                return self.findAndCountAll(options)
                  .then(results => {
                    count = results.count
                    return batch(results.rows)
                  })
                  .then(() => {
                    if (count >= (options.regressive ? options.limit : options.offset + options.limit)) {
                      options.offset = options.regressive ? 0 : options.offset + options.limit
                      return recursiveQuery(options)
                    }
                    else {
                      return Promise.resolve()
                    }
                  })
              }
              return recursiveQuery(options)
            },
            /**
             *
             * @param transaction
             * @param options
             * @returns {*}
             */
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
              else if (transaction && _.isObject(transaction) && transaction.token) {
                return Transaction.findOne({
                  where: {
                    token: transaction.token
                  },
                  transaction: options.transaction || null
                })
                  .then(resTransaction => {
                    if (!resTransaction) {
                      throw new Errors.FoundError(Error(`Transaction ${transaction.token} not found`))
                    }
                    return resTransaction
                  })
              }
              else if (transaction && _.isNumber(transaction)) {
                return Transaction.findById(transaction, options)
                  .then(resTransaction => {
                    if (!resTransaction) {
                      throw new Errors.FoundError(Error(`Transaction ${transaction} not found`))
                    }
                    return resTransaction
                  })
              }
              else if (transaction && _.isString(transaction)) {
                return Transaction.findOne({
                  where: {
                    token: transaction
                  },
                  transaction: options.transaction || null
                })
                  .then(resTransaction => {
                    if (!resTransaction) {
                      throw new Errors.FoundError(Error(`Transaction ${transaction} not found`))
                    }
                    return resTransaction
                  })
              }
              else {
                const err = new Error('Unable to resolve Transaction')
                return Promise.reject(err)
              }
            }
          },
          instanceMethods: {
            /**
             *
             * @returns {*}
             */
            retry: function() {
              this.retry_at = new Date(Date.now())
              this.total_retry_attempts++

              if (this.description && Boolean(this.description.match(/retry (\d+)/g))) {
                this.description = this.description.replace(/retry (\d+)/g, `retry ${this.total_retry_attempts}`)
              }
              else {
                this.description = `${this.description || 'transaction'} retry ${this.total_retry_attempts}`
              }

              return this
            },
            /**
             *
             * @returns {*}
             */
            cancel: function() {
              this.cancelled_at = new Date(Date.now())
              this.status = TRANSACTION_STATUS.CANCELLED

              if (this.description && !this.description.includes('cancelled')) {
                this.description = `${this.description || 'transaction'} cancelled`
              }

              return this
            },
            /**
             *
             * @param options
             * @returns {*}
             */
            resolveOrder: function(options) {
              options = options || {}
              const Order = app.orm['Order']
              if (
                this.Order
                && this.Order instanceof Order.Instance
                && options.reload !== true
              ) {
                return Promise.resolve(this)
              }
              else {
                return this.getOrder({transaction: options.transaction || null})
                  .then(order => {
                    order = order || null
                    this.Order = order
                    this.setDataValue('Order', order)
                    this.set('Order', order)
                  })
              }
            },
            /**
             *
             * @param options
             * @returns {Promise.<T>}
             */
            reconcileOrderFinancialStatus: function(options) {
              options = options || {}
              const Order = app.orm['Order']
              // If the status or the kind have not changed
              if (!this.changed('status') && !this.changed('kind')) {
                return Promise.resolve(this)
              }
              let resOrder
              return Order.findById(this.order_id, {
                // attributes: [
                //   'id',
                //   'name',
                //   'customer_id',
                //   'financial_status',
                //   'total_authorized',
                //   'total_captured',
                //   'total_refunds',
                //   'total_voided',
                //   'total_cancelled',
                //   'total_pending',
                //   'total_due'
                // ],
                transaction: options.transaction || null
              })
                .then(foundOrder => {
                  if (!foundOrder) {
                    throw new Error('Order could not be resolved for transaction')
                  }
                  resOrder = foundOrder
                  return resOrder.saveFinancialStatus({transaction: options.transaction || null})
                })
                .then(() => {
                  // Save the status changes
                  return resOrder.saveStatus({transaction: options.transaction || null})
                })
                .then(() => {
                  return this
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
        // Unique identifier for a particular order.
        token: {
          type: Sequelize.STRING,
          unique: true
        },
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
        source_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Order',
          //   key: 'id'
          // },
          allowNull: true
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
          defaultValue: TRANSACTION_DEFAULTS.SOURCE_NAME
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
          values: _.values(TRANSACTION_KIND),
          allowNull: false
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
          defaultValue: app.config.proxyCart.default_currency || TRANSACTION_DEFAULTS.CURRENCY
        },
        // A description of the Transaction
        description: {
          type: Sequelize.STRING
        },
        // The datetime the last retry was at
        retry_at: {
          type: Sequelize.DATE
        },
        // The total amounts of retries
        total_retry_attempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The datetime the transaction was cancelled
        cancelled_at: {
          type: Sequelize.DATE
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
