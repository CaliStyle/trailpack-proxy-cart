'use strict'

const Model = require('trails/model')

/**
 * @module GiftCard
 * @description A gift card is a an alternative payment method,
 * and has a code which is entered during checkout.
 * It has a balance which can be redeemed over multiple checkouts,
 * and can be assigned to a specific customer (optional).
 * Gift card codes cannot be retrieved once created – only a masked code or last 4 digits can be retrieved.
 */
module.exports = class GiftCard extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          scopes: {
            live: {
              where: {
                live_mode: true
              }
            }
          },
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.GiftCard.belongsTo(models.Order, {
                // as: 'order_id'
              })
              models.GiftCard.hasOne(models.OrderItem, {
                as: 'order_item_id'
              })
            },
            resolve: function(giftCard, options){
              //
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
          defaultValue: app.config.proxyEngine.live_mode
        }
      }
    }
    return schema
  }
}
