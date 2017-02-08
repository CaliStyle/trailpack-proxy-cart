'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const UNITS = require('../utils/enums').UNITS

/**
 * @module Shop
 * @description Shop Model
 */
module.exports = class Shop extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          defaultScope: {
            where: {
              live_mode: app.config.proxyEngine.live_mode
            }
          },
          hooks: {
            beforeValidate(values, options, fn) {
              if (!values.handle && values.name) {
                values.handle = values.name
              }
              fn()
            }
          },
          classMethods: {
            UNITS: UNITS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Shop.belongsTo(models.Shop, {
                as: 'address',
                through: {
                  model: models.ShopAddress,
                  foreignKey: 'shop_id',
                  unique: true,
                  scope: {
                    address: 'address'
                  },
                  constraints: false
                }
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
        // The name of the shop.
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The Unique string for shop
        handle: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          set: function(val) {
            this.setDataValue('handle', app.services.ProxyCartService.slug(val))
          }
        },
        // The contact phone number for the shop.
        phone: {
          type: Sequelize.STRING
        },
        // The shop's primary language locale
        primary_locale: {
          type: Sequelize.STRING,
          defaultValue: 'en-us',
          allowNull: false
        },
        // The three-letter code for the currency that the shop accepts.
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD',
          allowNull: false
        },
        // TODO Host? used to be domain: host is more congruent with ProxyRouter
        host: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The contact email address for the shop.
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true
          }
        },
        // A string representing the way currency is formatted when the currency isn't specified.
        money_format: {
          type: Sequelize.STRING,
          defaultValue: '$',
          allowNull: false
        },
        // A string representing the way currency is formatted when the currency is specified.
        money_with_currency_format: {
          type: Sequelize.STRING,
          defaultValue: '$ USD',
          allowNull: false
        },
        // Specifies whether or not taxes were charged for shipping. Valid values are: "true" or "false."
        tax_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // The setting for whether applicable taxes are included in product prices. Valid values are: "true" or "null."
        taxes_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // The setting for whether the shop is applying taxes on a per-county basis or not (US-only). Valid values are: "true" or "null."
        county_taxes: {
          type: Sequelize.BOOLEAN
        },
        // The name of the timezone the shop is in.
        timezone: {
          type: Sequelize.STRING,
          defaultValue: '(GMT-05:00) Eastern Time',
          allowNull: false
        },
        // The named timezone assigned by the IANA.
        iana_timezone: {
          type: Sequelize.STRING,
          defaultValue: 'America/New_York',
          allowNull: false
        },
        // A string representing the default unit of weight measurement for the shop.
        weight_unit: {
          type: Sequelize.ENUM,
          values: _.values(UNITS),
          defaultValue: UNITS.G
        },
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
