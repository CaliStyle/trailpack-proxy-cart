'use strict'

const Model = require('trails/model')

/**
 * @module ShopAddress
 * @description Shop Address Model
 */
module.exports = class ShopAddress extends Model {

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
        address_id: {
          type: Sequelize.INTEGER,
          unique: 'shopaddress_address'
        },
        address: {
          type: Sequelize.STRING,
          unique: 'shopaddress_address'
        },
        shop_id: {
          type: Sequelize.INTEGER,
          unique: 'shopaddress_address',
          references: null
        }
      }
    }
    return schema
  }
}
