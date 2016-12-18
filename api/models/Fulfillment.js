'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
/**
 * @module Fulfillment
 * @description Fulfillment Model
 */
module.exports = class Fulfillment extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            FULFILLMENT_STATUS: FULFILLMENT_STATUS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Fulfillment.belongsTo(models.Order, {
                // as: 'order'
              })
              models.Fulfillment.hasMany(models.OrderItem, {
                as: 'line_items'
              })
            }
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        receipt: {
          type: Sequelize.STRING
        },
        //The status of the fulfillment.
        status: {
          type: Sequelize.ENUM,
          values: _.values(FULFILLMENT_STATUS),
          defaultValue: FULFILLMENT_STATUS.NONE
        },
        //The name of the shipping company.
        tracking_company: {
          type: Sequelize.STRING
        },
        //The shipping number, provided by the shipping company.
        tracking_number: {
          type: Sequelize.STRING
        }
      }
    }
    return schema
  }
}
