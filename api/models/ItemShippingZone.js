'use strict'

const Model = require('trails/model')

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
        type: Sequelize.STRING,
        unique: 'shipping_zone_model'
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
