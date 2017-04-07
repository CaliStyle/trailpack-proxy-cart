'use strict'

const Model = require('trails/model')

/**
 * @module ItemCollection
 * @description Item Collection Model n:m
 */
module.exports = class ItemCollection extends Model {

  static config (app,Sequelize) {
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

  static schema (app,Sequelize) {
    const schema = {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      collection_id: {
        type: Sequelize.INTEGER,
        unique: 'collection_model',
        notNull: true
      },
      model: {
        type: Sequelize.STRING,
        unique: 'collection_model'
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'collection_model',
        notNull: true,
        references: null
      }
    }
    return schema
  }
}
