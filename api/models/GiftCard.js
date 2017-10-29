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
    return {
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
              foreignKey: 'order_id'
            })
            models.GiftCard.belongsTo(models.Customer, {
              // as: 'order_id'
              as: 'customer',
              foreignKey: 'customer_id'
            })
            models.GiftCard.belongsTo(models.Customer, {
              // as: 'order_id'
              as: 'recipient',
              foreignKey: 'recipient_id'
            })
            models.GiftCard.hasOne(models.OrderItem, {
              foreignKey: 'gift_card_id'
            })
          },
          resolve: function(giftCard, options){
            //
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      // The user that created this gift card
      customer_id: {
        type: Sequelize.INTEGER
      },
      // The user that is the benefactor of this gift card
      recipient_id: {
        type: Sequelize.INTEGER
      },
      // The order that created this gift card
      order_id: {
        type: Sequelize.INTEGER
      },
      // The remaining balance of the gift card
      balance: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // The currency the gift card is in
      currency: {
        type: Sequelize.STRING
      },
      // The code
      code: {
        type: Sequelize.STRING
      },
      // The code **** **** **** 1234
      code_masked: {
        type: Sequelize.STRING
      },
      // 1234
      last_characters: {
        type: Sequelize.STRING
      },
      // Note from Customer to Recipient
      note: {
        type: Sequelize.STRING
      },
      // Date time the card was disabled
      disabled_at: {
        type: Sequelize.DATE
      },
      // The date time the card expires
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
}
