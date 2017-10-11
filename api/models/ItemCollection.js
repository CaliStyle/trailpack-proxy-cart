'use strict'

const Model = require('trails/model')
const COLLECTION_MODELS = require('../../lib').Enums.COLLECTION_MODELS
const _ = require('lodash')
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
        },
        classMethods: {
          COLLECTION_MODELS: COLLECTION_MODELS
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
        type: Sequelize.ENUM,
        unique: 'collection_model',
        values: _.values(COLLECTION_MODELS)
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
