'use strict'

const Model = require('trails/model')

/**
 * @module RefundOrderItem
 * @description Refund Order Items
 */
module.exports = class RefundOrderItem extends Model {

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
          unique: 'refund_order_item'
        },
        order_item_id: {
          type: Sequelize.STRING,
          unique: 'refund_order_item'
        }
      }
    }
    return schema
  }
}
