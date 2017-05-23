'use strict'

const Model = require('trails/model')

/**
 * @module ItemCoupon
 * @description Item Coupon
 */
module.exports = class ItemCoupon extends Model {

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
      coupon_id: {
        type: Sequelize.INTEGER,
        unique: 'coupon_model'
      },
      model: {
        type: Sequelize.STRING,
        unique: 'coupon_model'
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'coupon_model',
        references: null
      }
    }
    return schema
  }
}
