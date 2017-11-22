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
    return {
      options: {
        underscored: true,
        enums: {
          IMAGE_MODELS: IMAGE_MODELS
        },
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.ItemImage.belongsTo(models.Image, {
              foreignKey: 'image_id'
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
  }
}
