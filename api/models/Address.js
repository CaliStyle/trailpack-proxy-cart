'use strict'

const Model = require('trails/model')

/**
 * @module Address
 * @description Address Model
 */
module.exports = class Address extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          hooks: {
            beforeCreate: (values, options, fn) => {
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
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {

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
        // Line 1
        address_1: {
          type: Sequelize.STRING
        },
        // Line 2
        address_2: {
          type: Sequelize.STRING
        },
        // Line 3
        address_3: {
          type: Sequelize.STRING
        },
        // Company
        company: {
          type: Sequelize.STRING
        },
        // City
        city: {
          type: Sequelize.STRING
        },
        // Name Prefix eg. Dr.
        prefix: {
          type: Sequelize.STRING
        },
        // First Name
        first_name: {
          type: Sequelize.STRING
        },
        // Last Name
        last_name: {
          type: Sequelize.STRING
        },
        // Name Suffix eg. Jr.
        suffix: {
          type: Sequelize.STRING
        },
        // Phone
        phone: {
          type: Sequelize.STRING
        },
        // Province/State
        province: {
          type: Sequelize.STRING
        },
        // Province/State abbr
        province_code: {
          type: Sequelize.STRING
        },
        // Country
        country: {
          type: Sequelize.STRING
        },
        // Country Code iso-alpha-2
        country_code: {
          type: Sequelize.STRING
        },
        // Country Name
        country_name: {
          type: Sequelize.STRING
        },
        // Postal/Zip Code
        postal_code: {
          type: Sequelize.STRING
        },
        //
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
