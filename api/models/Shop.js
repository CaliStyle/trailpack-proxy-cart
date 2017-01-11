'use strict'

const Model = require('trails/model')

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
          classMethods: {
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
          type: Sequelize.STRING
        },
        // The shop's street address.
        address_1: {
          type: Sequelize.STRING
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
          type: Sequelize.STRING
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
          type: Sequelize.STRING
        },
        // The two-letter code for the shop's province or state.
        province_code: {
          type: Sequelize.STRING
        },
        // The shop's country (by default equal to the two-letter country code).
        country: {
          type: Sequelize.STRING
        },
        // The two-letter country code corresponding to the shop's country.
        country_code: {
          type: Sequelize.STRING
        },
        // The shop's normalized country name.
        country_name: {
          type: Sequelize.STRING
        },
        // The zip or postal code of the shop's address.
        postal_code: {
          type: Sequelize.STRING
        },
        // The shop's primary locale.
        primary_locale: {
          type: Sequelize.STRING
        },
        // The three-letter code for the currency that the shop accepts.
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
        },
        // TODO Host ?
        domain: {
          type: Sequelize.STRING
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
          validate: { min: -90, max: 90 }
        },
        // Geographic coordinate specifying the east/west location of a shop.
        longitude: {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: null,
          validate: { min: -180, max: 180 }
        },
        // A string representing the way currency is formatted when the currency isn't specified.
        money_format: {
          type: Sequelize.STRING,
          defaultValue: '$'
        },
        // A string representing the way currency is formatted when the currency is specified.
        money_with_currency_format: {
          type: Sequelize.STRING,
          defaultValue: '$ USD'
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
          defaultValue: '(GMT-05:00) Eastern Time'
        },
        // The named timezone assigned by the IANA.
        iana_timezone: {
          type: Sequelize.STRING,
          defaultValue: 'America/New_York'
        },
        // Live Mode
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
