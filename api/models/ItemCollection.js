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
    return {
      options: {
        underscored: true,
        enums: {
          COLLECTION_MODELS: COLLECTION_MODELS
        },
        indexes: [
          {
            fields: ['collection_id', 'model', 'model_id', 'position']
          }
        ],
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.ItemCollection.belongsTo(models.Collection, {
              foreignKey: 'collection_id'
            })
          }
        }
      }
    }
  }

  static schema (app,Sequelize) {
    return {
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
      },
      position: {
        type: Sequelize.INTEGER
      }
    }
  }
}
