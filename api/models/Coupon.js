'use strict'

const Model = require('trails/model')

/**
 * @module Coupon
 * @description Coupon Model
 */
module.exports = class Coupon extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          scope: {
            expired: () => {
              return {
                where: {
                  expires_on: {
                    $gte: new Date()
                  },
                  live_mode: app.config.proxyEngine.live_mode
                }
              }
            }
          },
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Coupon.belongsToMany(models.Product, {
                as: 'products',
                through: {
                  model: models.ItemCoupon,
                  unique: false,
                  scope: {
                    model: 'product'
                  }
                },
                foreignKey: 'coupon_id',
                constraints: false
              })
              models.Coupon.belongsToMany(models.Customer, {
                as: 'customers',
                through: {
                  model: models.ItemCoupon,
                  unique: false,
                  scope: {
                    model: 'customer'
                  }
                },
                foreignKey: 'coupon_id',
                constraints: false
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
              options.limit = options.limit || 10
              options.offset = options.offset || 0

              const recursiveQuery = function(options) {
                let count = 0
                return self.findAndCountAll(options)
                  .then(results => {
                    count = results.count
                    return batch(results.rows)
                  })
                  .then(batched => {
                    if (count > options.offset + options.limit) {
                      options.offset = options.offset + options.limit
                      return recursiveQuery(options)
                    }
                    else {
                      return batched
                    }
                  })
              }
              return recursiveQuery(options)
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
        // The amount the coupon is valid for
        balance: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Currency of Coupon
        currency: {
          type: Sequelize.STRING
        },
        // Physical coupon code
        code: {
          type: Sequelize.STRING
        },
        // Physical coupon code with a mask
        code_masked: {
          type: Sequelize.STRING
        },
        // Last characters of the coupon code
        last_characters: {
          type: Sequelize.STRING
        },
        // Note about coupon
        note: {
          type: Sequelize.STRING
        },
        // Date to disable
        disabled_at: {
          type: Sequelize.DATE
        },
        // If coupon is disabled
        disabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // Date to expire
        expires_on: {
          type: Sequelize.DATE
        },
        // If Coupon is expired
        expired: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
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
