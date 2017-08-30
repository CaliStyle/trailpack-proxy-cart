/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

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
          scopes: {
            live: {
              where: {
                live_mode: true
              }
            }
          },
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // models.ShippingZone.hasMany(models.Province, {
              //   as: 'provinces'
              // })
              // models.ShippingZone.hasMany(models.Country, {
              //   as: 'country'
              // })
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
        //
        name: {
          type: Sequelize.STRING,
          notNull: true
        },
        //
        carrier_shipping_rate_providers: helpers.JSONB('ShippingZone', app, Sequelize, 'carrier_shipping_rate_providers', {
          defaultValue: []
        }),
        //
        price_based_shipping_rates: helpers.JSONB('ShippingZone', app, Sequelize, 'price_based_shipping_rates', {
          defaultValue: []
        }),
        //
        weight_based_shipping_rates: helpers.JSONB('ShippingZone', app, Sequelize, 'weight_based_shipping_rates', {
          defaultValue: []
        }),
        // Live Mode
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyEngine.live_mode
        }
      }
    }
    return schema
  }
}
