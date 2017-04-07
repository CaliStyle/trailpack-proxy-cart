'use strict'

const Model = require('trails/model')

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
        type: Sequelize.STRING,
        unique: 'tag_model',
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
