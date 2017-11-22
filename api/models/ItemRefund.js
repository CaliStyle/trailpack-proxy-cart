'use strict'

const Model = require('trails/model')
const REFUND_MODELS = require('../../lib').Enums.REFUND_MODELS
const _ = require('lodash')

/**
 * @module ItemRefund
 * @description Item Refund
 */
module.exports = class ItemRefund extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        enums: {
          REFUND_MODELS: REFUND_MODELS
        },
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.ItemRefund.belongsTo(models.Refund, {
              foreignKey: 'refund_id'
            })
            // models.ItemRefund.belongsTo(models.Transaction, {
            //   foreignKey: 'transaction_id'
            // })
            // models.ItemRefund.belongsTo(models.OrderItem, {
            //   foreignKey: 'order_item_id'
            // })
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      refund_id: {
        type: Sequelize.INTEGER,
        unique: 'item_refund',
        notNull: true
      },
      model: {
        type: Sequelize.ENUM,
        unique: 'item_refund',
        notNull: true,
        values: _.values(REFUND_MODELS)
      },
      model_id: {
        type: Sequelize.STRING,
        unique: 'item_refund',
        references: null,
        notNull: true
      }
    }
  }
}
