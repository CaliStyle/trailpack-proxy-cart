'use strict'

const Model = require('trails/model')

/**
 * @module ItemMetadata
 * @description Item Metadata n:m
 */
module.exports = class ItemMetadata extends Model {

  static config (app, Sequelize) {
    const config = {

    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      metadata_id: {
        type: Sequelize.INTEGER,
        unique: 'metadata_model'
      },
      model: {
        type: Sequelize.STRING,
        unique: 'metadata_model'
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'metadata_model',
        references: null
      }
    }
    return schema
  }
}
