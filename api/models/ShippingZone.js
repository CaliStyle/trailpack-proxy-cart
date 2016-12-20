/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('../utils/helpers')

/**
 * @module ShippingZone
 * @description Shipping Zone Model
 */
module.exports = class ShippingZone extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.ShippingZone.hasMany(models.Province, {
                as: 'provinces'
              })
              models.ShippingZone.hasMany(models.Country, {
                as: 'country'
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
        name: {
          type: Sequelize.STRING
        },
        carrier_shipping_rate_providers: helpers.ARRAY('shippingzone', app, Sequelize, Sequelize.STRING, 'carrier_shipping_rate_providers', {
          defaultValue: []
        }),
        price_based_shipping_rates: helpers.ARRAY('shippingzone', app, Sequelize, Sequelize.STRING, 'price_based_shipping_rates', {
          defaultValue: []
        }),
        weight_based_shipping_rates: helpers.ARRAY('shippingzone', app, Sequelize, Sequelize.STRING, 'weight_based_shipping_rates', {
          defaultValue: []
        }),

        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
