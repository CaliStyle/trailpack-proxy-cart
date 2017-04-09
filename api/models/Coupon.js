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
        //
        balance: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Currency of Coupon
        currency: {
          type: Sequelize.STRING
        },
        // Physical copon code
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
        // Date to expire
        expires_on: {
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
