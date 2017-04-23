'use strict'

const Model = require('trails/model')

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
        type: Sequelize.STRING,
        unique: 'discount_model'
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
