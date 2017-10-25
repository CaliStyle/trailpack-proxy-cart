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
        underscored: true
      },
      classMethods: {
        DISCOUNT_MODELS: DISCOUNT_MODELS,
        // associate: (models) => {
        //   models.ItemDiscount.belongsTo(models.Discount, {
        //     // targetKey: 'discount_id'
        //     unique: 'discount_model',
        //   })
        // }
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
