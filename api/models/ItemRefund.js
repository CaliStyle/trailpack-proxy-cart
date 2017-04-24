'use strict'

const Model = require('trails/model')

/**
 * @module ItemRefund
 * @description Item Refund
 */
module.exports = class ItemRefund extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
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
          type: Sequelize.STRING,
          unique: 'item_refund',
          notNull: true
        },
        model_id: {
          type: Sequelize.STRING,
          unique: 'item_refund',
          references: null,
          notNull: true
        }
      }
    }
    return schema
  }
}
