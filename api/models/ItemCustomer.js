'use strict'

const Model = require('trails/model')
const CUSTOMER_MODELS = require('../../lib').Enums.CUSTOMER_MODELS
const _ = require('lodash')
/**
 * @module ItemCustomer
 * @description Item Customer Model n:m
 */
module.exports = class ItemCustomer extends Model {

  static config (app,Sequelize) {
    return {
      options: {
        underscored: true,
        enums: {
          CUSTOMER_MODELS: CUSTOMER_MODELS
        },
        indexes: [
          {
            fields: ['customer_id', 'model', 'model_id', 'position']
          }
        ],
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.ItemCustomer.belongsTo(models.Customer, {
              foreignKey: 'customer_id'
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
      customer_id: {
        type: Sequelize.INTEGER,
        unique: 'customer_model',
        notNull: true
      },
      model: {
        type: Sequelize.ENUM,
        unique: 'customer_model',
        values: _.values(CUSTOMER_MODELS)
      },
      model_id: {
        type: Sequelize.INTEGER,
        unique: 'customer_model',
        notNull: true,
        references: null
      },
      position: {
        type: Sequelize.INTEGER
      }
    }
  }
}
