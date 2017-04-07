'use strict'

const Model = require('trails/model')

/**
 * @module CartAddress
 * @description Cart Address Model
 */
module.exports = class CartAddress extends Model {

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
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        address_id: {
          type: Sequelize.INTEGER,
          unique: 'cartaddress_address'
        },
        address: {
          type: Sequelize.STRING,
          unique: 'cartaddress_address'
        },
        cart_id: {
          type: Sequelize.INTEGER,
          unique: 'cartaddress_address',
          references: null
        }
      }
    }
    return schema
  }
}
