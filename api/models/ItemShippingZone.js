'use strict'

const Model = require('trails/model')
const SHIPPING_MODELS = require('../../lib').Enums.SHIPPING_MODELS
const _ = require('lodash')
/**
 * @module ItemShippingZone
 * @description Country and Province Shipping Zone
 */
module.exports = class ItemShippingZone extends Model {

  static config (app,Sequelize) {
    return {
      options: {
        underscored: true
      },
      classMethods: {
        SHIPPING_MODELS: SHIPPING_MODELS
      }
    }
  }

  static schema (app,Sequelize) {
    return {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      shipping_zone_id: {
        type: Sequelize.INTEGER,
        unique: 'shipping_zone_model',
        notNull: true
      },
      model: {
        type: Sequelize.ENUM,
        unique: 'shipping_zone_model',
        values: _.values(SHIPPING_MODELS)
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'shipping_zone_model',
        notNull: true,
        references: null
      }
    }
  }
}
