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
          hooks: {
            beforeCreate: (values, options, fn) => {
              // If not token was already created, create it
              if (!values.token) {
                values.token = `source_${shortId.generate()}`
              }
              fn()
            },
            afterCreate: (values, options, fn) => {
              app.services.AccountService.afterSourceCreate(values)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            afterDestroy: (values, options, fn) => {
              app.services.AccountService.afterSourceDestroy(values)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
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
            },
            resolve: function(source, options){
              const Source =  this
              if (source instanceof Source.Instance){
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
                return Source.findOne(_.defaultsDeep({
                  where: {
                    token: source.token
                  }
                }, options))
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
                return Source.findOne(_.defaultsDeep({
                  where: {
                    token: source
                  }
                }, options))
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
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
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
    return schema
  }
}
