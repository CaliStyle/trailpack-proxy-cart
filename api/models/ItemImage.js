'use strict'

const Model = require('trails/model')
const IMAGE_MODELS = require('../../lib').Enums.IMAGE_MODELS
const _ = require('lodash')

/**
 * @module ItemImage
 * @description Item Image n:m
 */
module.exports = class ItemImage extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        },
        classMethods: {
          IMAGE_MODELS: IMAGE_MODELS
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
      image_id: {
        type: Sequelize.INTEGER,
        unique: 'image_model'
      },
      // Model the image belongs to
      model: {
        type: Sequelize.ENUM,
        unique: 'image_model',
        values: _.values(IMAGE_MODELS)
      },
      // ID of the model the image belongs to
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'image_model',
        references: null
      },
      // The order of the image in the list of images.
      position: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      }
    }
    return schema
  }
}
