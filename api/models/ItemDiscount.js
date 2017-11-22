'use strict'

const Model = require('trails/model')
const DISCOUNT_MODELS = require('../../lib').Enums.DISCOUNT_MODELS
const _ = require('lodash')

/**
 * @module ItemDiscount
 * @description Item Discount
 */
module.exports = class ItemDiscount extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        enums: {
          DISCOUNT_MODELS: DISCOUNT_MODELS
        },
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            // TODO, fix the foreign constraint so that this works again
            // models.ItemDiscount.belongsTo(models.Discount, {
            //   foreignKey: 'discount_id'
            // })
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
      discount_id: {
        type: Sequelize.INTEGER,
        unique: 'discount_model',
        // references: {
        //   model: app.orm['Discount'],
        //   key: 'id'
        // }
      },
      model: {
        type: Sequelize.ENUM,
        unique: 'discount_model',
        values: _.values(DISCOUNT_MODELS)
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'discount_model',
        references: null
      }
    }
  }
}
