'use strict'

const Model = require('trails/model')
const DISCOUNT_MODELS = require('../../lib').Enums.DISCOUNT_MODELS
const _ = require('lodash')

/**
 * @module ItemDiscount
 * @description Item Discount
 */
module.exports = class ItemDiscount extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        },
        classMethods: {
          DISCOUNT_MODELS: DISCOUNT_MODELS
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      discount_id: {
        type: Sequelize.INTEGER,
        unique: 'discount_model'
      },
      model: {
        type: Sequelize.ENUM,
        unique: 'discount_model',
        values: _.values(DISCOUNT_MODELS)
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'discount_model',
        references: null
      }
    }
    return schema
  }
}
