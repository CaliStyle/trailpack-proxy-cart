'use strict'

const Model = require('trails/model')
// const helpers = require('proxy-engine-helpers')

/**
 * @module Refund
 * @description Refund Model
 */
module.exports = class Refund extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Refund.belongsTo(models.Order, {
                // as: 'order_id'
              })
              models.Refund.belongsToMany(models.OrderItem, {
                as: 'refund_order_items',
                through: models.RefundOrderItem
                // as: 'order_id'
              })
              models.Refund.belongsToMany(models.Transaction, {
                as: 'transactions',
                through: models.RefundTransaction
                // as: 'order_id'
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
        processed_at: {
          type: Sequelize.DATE
        },
        // refund_order_items: helpers.ARRAY('Refund', app, Sequelize, Sequelize.JSON, 'refund_order_items', {
        //   defaultValue: []
        // }),
        restock: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.refund_restock
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
