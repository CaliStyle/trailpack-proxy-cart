'use strict'

const Model = require('trails/model')
const COUPON_MODELS = require('../../lib').Enums.COUPON_MODELS
const _ = require('lodash')
/**
 * @module ItemCoupon
 * @description Item Coupon
 */
module.exports = class ItemCoupon extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true
      },
      classMethods: {
        COUPON_MODELS: COUPON_MODELS
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
  }
}
