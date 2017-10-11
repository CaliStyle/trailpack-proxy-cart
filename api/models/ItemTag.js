'use strict'

const Model = require('trails/model')
const TAG_MODELS = require('../../lib').Enums.TAG_MODELS
const _ = require('lodash')

/**
 * @module ItemTag
 * @description Item Tag Model n:m
 */
module.exports = class ItemTag extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        },
        classMethods: {
          TAG_MODELS: TAG_MODELS
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tag_id: {
        type: Sequelize.INTEGER,
        unique: 'tag_model',
        notNull: true
      },
      model: {
        type: Sequelize.ENUM,
        unique: 'tag_model',
        values: _.values(TAG_MODELS)
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'tag_model',
        references: null
      }
    }
    return schema
  }
}
