'use strict'

const Model = require('trails/model')
const COUPON_MODELS = require('../utils/enums').COUPON_MODELS
const _ = require('lodash')
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
        },
        classMethods: {
          COUPON_MODELS: COUPON_MODELS
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
        type: Sequelize.ENUM,
        unique: 'coupon_model',
        values: _.values(COUPON_MODELS)
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
