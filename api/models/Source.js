/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
const shortId = require('shortid')

/**
 * @module Source
 * @description Payment Source Model
 */
module.exports = class Source extends Model {

  static config (app, Sequelize) {
    return {
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
          }
        },
        hooks: {
          beforeCreate: (values, options) => {
            // If not token was already created, create it
            if (!values.token) {
              values.token = `source_${shortId.generate()}`
            }
          },
          afterCreate: (values, options) => {
            return app.services.AccountService.afterSourceCreate(values)
              .catch(err => {
                return Promise.reject(err)
              })
          },
          afterDestroy: (values, options) => {
            return app.services.AccountService.afterSourceDestroy(values)
              .catch(err => {
                return Promise.reject(err)
              })
          },
        },
        classMethods: {
          associate: (models) => {
            models.Source.belongsTo(models.Account, {
              // as: 'account',
              // through: {
              //   model: models.CustomerSource,
              //   unique: false,
              //   foreignKey: 'account_id',
              // }
              // constraints: false
            })
            models.Source.belongsTo(models.Customer, {
              // as: 'customer',
              // through: {
              //   model: models.CustomerSource,
              //   unique: false,
              //   foreignKey: 'customer_id',
              // }
              // constraints: false
            })
            models.Source.hasMany(models.Transaction, {
              as: 'transactions',
              // constraints: false
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
          resolve: function(source, options){
            const Source =  this
            if (source instanceof Source){
              return Promise.resolve(source)
            }
            else if (source && _.isObject(source) && source.id) {
              return Source.findById(source.id, options)
                .then(resSource => {
                  if (!resSource) {
                    throw new Errors.FoundError(Error(`Source ${source.id} not found`))
                  }
                  return resSource
                })
            }
            else if (source && _.isObject(source) && source.token) {
              return Source.findOne(app.services.ProxyEngineService.mergeOptionDefaults(
                options || {},
                {
                  where: {
                    token: source.token
                  }
                }
              ))
                .then(resSource => {
                  if (!resSource) {
                    throw new Errors.FoundError(Error(`Source ${source.token} not found`))
                  }
                  return resSource
                })
            }
            else if (source && _.isNumber(source)) {
              return Source.findById(source, options)
                .then(resSource => {
                  if (!resSource) {
                    throw new Errors.FoundError(Error(`Source ${source} not found`))
                  }
                  return resSource
                })
            }
            else if (source && _.isString(source)) {
              return Source.findOne(app.services.ProxyEngineService.mergeOptionDefaults(
                options || {},
                {
                  where: {
                    token: source
                  }
                }
              ))
                .then(resSource => {
                  if (!resSource) {
                    throw new Errors.FoundError(Error(`Source ${source} not found`))
                  }
                  return resSource
                })
            }
            else {
              // TODO create proper error
              const err = new Error(`Unable to resolve Source ${source}`)
              return Promise.reject(err)
            }
          }
        },
        instanceMethods: {
          /**
           * Get the Credit/Debit Card Brand Company Name
           */
          getBrand: function() {
            let brand = this.gateway

            if (this.payment_details && this.payment_details.credit_card_company) {
              brand = this.payment_details.credit_card_company
            }
            return brand
          },
          /**
           * Get's the type of the
           */
          getType: function() {
            let type
            switch (this.payment_details.type) {
            case 'credit_card':
              type = 'Credit Card'
              break
            case 'debit_card':
              type = 'Debit Card'
              break
            default:
              type = 'Payment Method'
            }
            return type
          },
          /**
           * Get's the Last 4 Digits of a Payment Method, if Applicable
           * @returns {string}
           */
          getLast4: function () {
            let last4 = '****'

            if (this.payment_details && this.payment_details.credit_card_last4) {
              last4 = this.payment_details.credit_card_last4
            }
            return last4
          },

          /**
           * Get's the expiration date of the card if applicable.
           * @returns {string}
           */
          getExpiration: function () {
            let expiration = 'MM/YYYY'

            if (
              this.payment_details
              && this.payment_details.credit_card_exp_year
              && this.payment_details.credit_card_exp_month
            ) {
              expiration = `${this.payment_details.credit_card_exp_month}/${this.payment_details.credit_card_exp_year}`
            }
            return expiration
          },
          /**
           *
           * @param preNotification
           * @param options
           */
          notifyCustomer: function(preNotification, options) {
            options = options || {}
            if (this.customer_id) {
              return this.resolveCustomer({
                attributes: ['id','email','company','first_name','last_name','full_name'],
                transaction: options.transaction || null,
                reload: options.reload || null
              })
                .then(() => {
                  if (this.Customer && this.Customer instanceof app.orm['Customer']) {
                    return this.Customer.notifyUsers(preNotification, {transaction: options.transaction || null})
                  }
                  else {
                    return
                  }
                })
                .then(() => {
                  return this
                })
            }
            else {
              return Promise.resolve(this)
            }
          },
          resolveCustomer: function(options) {
            options = options || {}
            if (
              this.Customer
              && this.Customer instanceof app.orm['Customer']
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            // A subscription always requires a customer, but just in case.
            else if (!this.customer_id) {
              return Promise.resolve(this)
            }
            else {
              return this.getCustomer({transaction: options.transaction || null})
                .then(_customer => {
                  _customer = _customer || null
                  this.Customer = _customer
                  this.setDataValue('Customer', _customer)
                  this.set('Customer', _customer)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {Promise.<T>}
           */
          sendExpiredEmail(options) {
            options = options || {}
            return app.emails.Source.expired(this, {
              send_email: app.config.proxyCart.emails.sourceExpired
            }, {
              transaction: options.transaction || null
            })
              .then(email => {
                return this.notifyCustomer(email, {transaction: options.transaction || null})
              })
              .catch(err => {
                app.log.error(err)
                return
              })
          },
          /**
           *
           * @param options
           * @returns {Promise.<T>}
           */
          sendWillExpireEmail(options) {
            options = options || {}
            return app.emails.Source.willExpire(this, {
              send_email: app.config.proxyCart.emails.sourceWillExpire
            }, {
              transaction: options.transaction || null
            })
              .then(email => {
                return this.notifyCustomer(email, {transaction: options.transaction || null})
              })
              .catch(err => {
                app.log.error(err)
                return
              })
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      customer_id: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'Customer',
        //   key: 'id'
        // },
        allowNull: false
      },
      account_id: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'Customer',
        //   key: 'id'
        // },
        allowNull: true
      },
      // Unique identifier for a particular source.
      token: {
        type: Sequelize.STRING,
        unique: true
      },
      // The gateway used to create this source
      gateway: {
        type: Sequelize.STRING,
        defaultValue: 'payment_processor'
      },
      // The foreign key attribute on the 3rd party provider
      account_foreign_key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // The foreign id on the 3rd party provider
      account_foreign_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // The foreign key attribute on the 3rd party provider
      foreign_key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // The foreign id on the 3rd party provider
      foreign_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // If this is the default payment source for an account
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      // An object containing information about the credit card used for this transaction. Normally It has the following properties:
      // type: The type of Source: credit_card, debit_card, prepaid_card, apple_pay, bitcoin
      // gateway: the Gateway used
      // avs_result_code: The Response code from AVS the address verification system. The code is a single letter; see this chart for the codes and their definitions.
      // credit_card_iin: The issuer identification number (IIN), formerly known as bank identification number (BIN) ] of the customer's credit card. This is made up of the first few digits of the credit card number.
      // credit_card_company: The name of the company who issued the customer's credit card.
      // credit_card_number: The customer's credit card number, with most of the leading digits redacted with Xs.
      // credit_card_last4: the last 4 of the customer's credit card number
      // credit_card_exp_month: the 2 digit month
      // credit_card_exp_year: the 2-4 digit year
      // cvv_result_code: The Response code from the credit card company indicating whether the customer entered the card security code, a.k.a. card verification value, correctly. The code is a single letter or empty string; see this chart http://www.emsecommerce.net/avs_cvv2_response_codes.htm for the codes and their definitions.
      // token: The card token from the Gateway

      payment_details: helpers.JSONB('Source', app, Sequelize, 'payment_details', {
        defaultValue: {}
      }),

      // Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }

    }
  }
}
