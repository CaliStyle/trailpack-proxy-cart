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
                  live_mode: app.config.proxyCart.live_mode
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
        balance: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        currency: {
          type: Sequelize.STRING
        },
        code: {
          type: Sequelize.STRING
        },
        code_masked: {
          type: Sequelize.STRING
        },
        last_characters: {
          type: Sequelize.STRING
        },
        note: {
          type: Sequelize.STRING
        },
        disabled_at: {
          type: Sequelize.DATE
        },
        expires_on: {
          type: Sequelize.DATE
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
