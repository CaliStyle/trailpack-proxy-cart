'use strict'

const Model = require('trails/model')
const SHIPPING_MODELS = require('../utils/enums').SHIPPING_MODELS
const _ = require('lodash')
/**
 * @module ItemShippingZone
 * @description Country and Province Shipping Zone
 */
module.exports = class ItemShippingZone extends Model {

  static config (app,Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        },
        classMethods: {
          SHIPPING_MODELS: SHIPPING_MODELS
        }
      }
    }
    return config
  }

  static schema (app,Sequelize) {
    const schema = {
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
    return schema
  }
}
