'use strict'

const Model = require('trails/model')

/**
 * @module ItemCollection
 * @description Item Collection Model n:m
 */
module.exports = class ItemCollection extends Model {

  static config (app,Sequelize) {
    const config = {}
    return config
  }

  static schema (app,Sequelize) {
    const schema = {
      collection_id: {
        type: Sequelize.INTEGER,
        unique: 'collection_model'
      },
      model: {
        type: Sequelize.STRING,
        unique: 'collection_model'
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'collection_model',
        references: null
      }
    }
    return schema
  }
}
