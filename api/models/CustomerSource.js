'use strict'

const Model = require('trails/model')

/**
 * @module CustomerSource
 * @description Customer Source
 */
module.exports = class CustomerSource extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true
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
}
