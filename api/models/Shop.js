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
          hooks: {
            beforeValidate: (values, options, fn) => {
              try {
                values = app.services.ProxyCartService.normalizeAddress(values)
                return fn(null, values)
              }
              catch (err) {
                return fn(err, values)
              }
            }
          },
          classMethods: {
            UNITS: UNITS
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
        // The name of the shop.
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The shop's street address.
        address_1: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The shop's additional street address (apt, suite, etc.).
        address_2: {
          type: Sequelize.STRING
        },
        // The shop's optional additional street address (apt, suite, etc.).
        address_3: {
          type: Sequelize.STRING
        },
        // The city in which the shop is located.
        city: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The company address field in which the shop is located.
        company: {
          type: Sequelize.STRING
        },
        // The contact phone number for the shop.
        phone: {
          type: Sequelize.STRING
        },
        // The shop's normalized province or state name.
        province: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The two-letter code for the shop's province or state.
        province_code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The shop's country (by default equal to the two-letter country code).
        country: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The two-letter country code corresponding to the shop's country.
        country_code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The shop's normalized country name.
        country_name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The zip or postal code of the shop's address.
        postal_code: {
          type: Sequelize.STRING,
          allowNull: false
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
        // // If Shop is the Default Shop
        // default: {
        //   type: Sequelize.BOOLEAN,
        //   defaultValue: true
        // },
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
        // Geographic coordinate specifying the north/south location of a shop.
        latitude: {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: null,
          validate: {
            min: -90,
            max: 90
          }
        },
        // Geographic coordinate specifying the east/west location of a shop.
        longitude: {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: null,
          validate: {
            min: -180,
            max: 180
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
