'use strict'

const Model = require('trails/model')

/**
 * @module OrderSource
 * @description Order Source Many to Many
 */
module.exports = class OrderSource extends Model {

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
        unique: 'orderssource_source'
      },
      order_id: {
        type: Sequelize.INTEGER,
        unique: 'orderssource_source',
        references: null
      }
    }
  }
}
