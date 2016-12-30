'use strict'

const Model = require('trails/model')

/**
 * @module ItemAddress
 * @description Address Model n:m
 */
module.exports = class ItemAddress extends Model {

  static config (app, Sequelize) {
    const config = {}
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      address_id: {
        type: Sequelize.INTEGER,
        unique: 'address_model'
      },
      type: {
        type: Sequelize.STRING,
        unique: 'address_model'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        unique: 'address_model',
        references: null
      }
    }
    return schema
  }
}
