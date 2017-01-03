'use strict'

const Model = require('trails/model')

/**
 * @module CustomerUpload
 * @description Customer Upload Model
 */
module.exports = class CustomerUpload extends Model {

  static config (app, Sequelize) {
    const config = {
      migrate: 'drop', //override default models configurations if needed
      store: 'uploads',
      options: {
        underscored: true
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      // Upload ID
      upload_id: {
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
      // Phone
      phone: {
        type: Sequelize.STRING
      },
      // Line 1
      shipping_address_1: {
        type: Sequelize.STRING
      },
      // Line 2
      shipping_address_2: {
        type: Sequelize.STRING
      },
      // Line 3
      shipping_address_3: {
        type: Sequelize.STRING
      },
      // Company
      shipping_company: {
        type: Sequelize.STRING
      },
      // City
      shipping_city: {
        type: Sequelize.STRING
      },
      // Province/State abbr
      shipping_province_code: {
        type: Sequelize.STRING
      },
      // Country Code iso-alpha-2
      shipping_country_code: {
        type: Sequelize.STRING
      },
      // Postal/Zip Code
      shipping_postal_code: {
        type: Sequelize.STRING
      },

      // Line 1
      billing_address_1: {
        type: Sequelize.STRING
      },
      // Line 2
      billing_address_2: {
        type: Sequelize.STRING
      },
      // Line 3
      billing_address_3: {
        type: Sequelize.STRING
      },
      // Company
      billing_company: {
        type: Sequelize.STRING
      },
      // City
      billing_city: {
        type: Sequelize.STRING
      },
      // Province/State abbr
      billing_province_code: {
        type: Sequelize.STRING
      },
      // Country Code iso-alpha-2
      billing_country_code: {
        type: Sequelize.STRING
      },
      // Postal/Zip Code
      billing_postal_code: {
        type: Sequelize.STRING
      }
    }
    return schema
  }
}
