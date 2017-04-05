'use strict'

const Model = require('trails/model')

/**
 * @module CustomerSource
 * @description Customer Source
 */
module.exports = class CustomerSource extends Model {

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
        source_id: {
          type: Sequelize.INTEGER,
          unique: 'customersource_source'
        },
        source: {
          type: Sequelize.STRING,
          unique: 'customersource_source'
        },
        account_id: {
          type: Sequelize.INTEGER,
          unique: 'customersource_source',
          references: null
        },
        customer_id: {
          type: Sequelize.INTEGER,
          unique: 'customersource_source',
          references: null
        }
      }
    }
    return schema
  }
}
