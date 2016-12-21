'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const FULFILLMENT_EVENT_STATUS = require('../utils/enums').FULFILLMENT_EVENT_STATUS
/**
 * @module FulfillmentEvent
 * @description Fulfillment Event Model
 */
module.exports = class FulfillmentEvent extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            FULFILLMENT_EVENT_STATUS: FULFILLMENT_EVENT_STATUS
            /**
             * Associate the Model
             * @param models
             */
            // associate: (models) => {
            //
            // }
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
        status: {
          type: Sequelize.ENUM,
          values: _.values(FULFILLMENT_EVENT_STATUS)
        },
        message: {
          type: Sequelize.STRING
        },
        address_1: {
          type: Sequelize.STRING
        },
        province: {
          type: Sequelize.STRING
        },
        country: {
          type: Sequelize.STRING
        },
        postal_code: {
          type: Sequelize.STRING
        },
        latitude: {
          type: Sequelize.FLOAT
        },
        longitude: {
          type: Sequelize.FLOAT
        }
      }
    }
    return schema
  }
}
