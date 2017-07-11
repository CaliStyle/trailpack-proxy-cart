'use strict'

const Model = require('trails/model')

/**
 * @module CustomerAddress
 * @description Customer Address Model
 */
module.exports = class ItemAddress extends Model {

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
          autoIncrement: true
        },
        address_id: {
          type: Sequelize.INTEGER,
          // unique: 'itemaddress_address'
        },
        model: {
          type: Sequelize.STRING,
          // unique: 'itemaddress_address'
        },
        model_id: {
          type: Sequelize.INTEGER,
          // unique: 'itemaddress_address',
          references: null
        },
        address: {
          type: Sequelize.STRING,
          defaultValue: 'address',
          // unique: 'itemaddress_address'
        }
      }
    }
    return schema
  }
}
