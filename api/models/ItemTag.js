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
    return {
      options: {
        underscored: true,
        enums: {
          TAG_MODELS: TAG_MODELS
        },
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.ItemTag.belongsTo(models.Tag, {
              foreignKey: 'tag_id'
            })
          }
        }
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
  }
}
