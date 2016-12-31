'use strict'

const Model = require('trails/model')

/**
 * @module CustomerAddress
 * @description Customer Address Model
 */
module.exports = class CustomerAddress extends Model {

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
          unique: 'customeraddress_address'
        },
        address: {
          type: Sequelize.STRING,
          unique: 'customeraddress_address'
        },
        customer_id: {
          type: Sequelize.INTEGER,
          unique: 'customeraddress_address',
          references: null
        }
      }
    }
    return schema
  }
}
