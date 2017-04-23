'use strict'

const Model = require('trails/model')

/**
 * @module RefundTransaction
 * @description Refund Transaction
 */
module.exports = class RefundTransaction extends Model {

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
          unique: 'refund_transaction'
        },
        transaction_id: {
          type: Sequelize.STRING,
          unique: 'refund_transaction'
        }
      }
    }
    return schema
  }
}
