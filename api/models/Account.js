/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
const shortId = require('shortid')
const queryDefaults = require('../utils/queryDefaults')

/**
 * @module Account
 * @description Account
 */
module.exports = class Account extends Model {

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
          },
        },
        hooks: {
          beforeCreate: (values, options) => {
            // If not token was already created, create it
            if (!values.token) {
              values.token = `account_${shortId.generate()}`
            }
          }
        },
        classMethods: {
          associate: (models) => {
            models.Account.belongsTo(models.Customer, {
              foreignKey: 'customer_id'
            })

            models.Account.belongsToMany(models.Source, {
              as: 'sources',
              through: {
                model: models.CustomerSource,
                unique: false
              },
              foreignKey: 'account_id'
              // constraints: false
            })

            models.Account.hasMany(models.AccountEvent, {
              as: 'account_events',
              foreignKey: 'account_id'
            })
          },
          findByIdDefault: function(id, options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Account.default(app),
              options || {}
            )
            return this.findById(id, options)
          },
          resolve: function(account, options) {
            options = options || {}
            const Account = this
            if (account instanceof Account) {
              return Promise.resolve(account)
            }
            else if (account && _.isObject(account) && account.id) {
              return Account.findById(account.id, options)
                .then(resAccount => {
                  if (!resAccount) {
                    throw new Errors.FoundError(Error(`Account ${account.id} not found`))
                  }
                  return resAccount
                })
            }
            else if (account && _.isObject(account) && account.gateway && account.customer_id) {
              return Account.findOne(_.defaultsDeep({
                where: {
                  gateway: account.gateway,
                  customer_id: account.customer_id
                }
              }, options))
                .then(resAccount => {
                  if (!resAccount) {
                    throw new Errors.FoundError(Error(`Account with customer id ${account.customer_id} not found`))
                  }
                  return resAccount
                })
            }
            else if (account && _.isObject(account) && account.token) {
              return Account.findOne(_.defaultsDeep({
                where: {
                  token: account.token
                }
              }, options))
                .then(resAccount => {
                  if (!resAccount) {
                    throw new Errors.FoundError(Error(`Account token ${account.token} not found`))
                  }
                  return resAccount
                })
            }
            else if (account && _.isNumber(account)) {
              return Account.findById(account, options)
                .then(resAccount => {
                  if (!resAccount) {
                    throw new Errors.FoundError(Error(`Account ${account.token} not found`))
                  }
                  return resAccount
                })
            }
            else if (account && _.isString(account)) {
              return Account.findOne(_.defaultsDeep({
                where: {
                  token: account
                }
              }, options))
                .then(resAccount => {
                  if (!resAccount) {
                    throw new Errors.FoundError(Error(`Account ${account} not found`))
                  }
                  return resAccount
                })
            }
            else {
              // TODO create proper error
              const err = new Error(`Unable to resolve Account ${account}`)
              return Promise.reject(err)
            }
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
      // Unique identifier for a particular source.
      token: {
        type: Sequelize.STRING,
        unique: true
      },
      email: {
        type: Sequelize.STRING
      },
      gateway: {
        type: Sequelize.STRING,
        defaultValue: 'payment_processor'
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
      // The data from the 3rd party response
      data: helpers.JSONB('Account', app, Sequelize, 'data', {
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
