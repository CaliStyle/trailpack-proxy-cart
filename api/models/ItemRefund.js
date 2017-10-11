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
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        },
        classMethods: {
          REFUND_MODELS: REFUND_MODELS
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
    return schema
  }
}
