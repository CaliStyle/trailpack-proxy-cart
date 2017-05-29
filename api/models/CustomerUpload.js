/* eslint new-cap: [0] */
/* eslint no-console: [0] */

'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

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
        underscored: true,
        classMethods: {
          /**
           *
           * @param options
           * @param batch
           * @returns Promise.<T>
           */
          batch: function (options, batch) {
            const self = this
            options.limit = options.limit || 10
            options.offset = options.offset || 0

            const recursiveQuery = function(options) {
              let count = 0
              return self.findAndCountAll(options)
                .then(results => {

                  count = results.count
                  // console.log('Broke', count)
                  return batch(results.rows)
                })
                .then(batched => {
                  if (count > options.offset + options.limit) {
                    options.offset = options.offset + options.limit
                    // console.log('Broke run again', count)
                    return recursiveQuery(options)
                  }
                  else {
                    return batched
                  }
                })
            }
            return recursiveQuery(options)
          }
        }
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
      // Account Balance
      account_balance: {
        type: Sequelize.INTEGER
      },
      // email
      email: {
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
      // Company
      company: {
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
      shipping_province: {
        type: Sequelize.STRING
      },
      // Country Code iso-alpha-2
      shipping_country: {
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
      billing_province: {
        type: Sequelize.STRING
      },
      // Country Code iso-alpha-2
      billing_country: {
        type: Sequelize.STRING
      },
      // Postal/Zip Code
      billing_postal_code: {
        type: Sequelize.STRING
      },
      // 'Collections'
      collections: helpers.ARRAY('CustomerUpload', app, Sequelize, Sequelize.STRING, 'collections', {
        defaultValue: []
      }),
      // 'Tags'
      tags: helpers.ARRAY('CustomerUpload', app, Sequelize, Sequelize.STRING, 'tags', {
        defaultValue: []
      }),
      // 'Accounts'
      accounts: helpers.ARRAY('CustomerUpload', app, Sequelize, Sequelize.JSON, 'accounts', {
        defaultValue: []
      }),
      // 'Customers'
      customers: helpers.ARRAY('CustomerUpload', app, Sequelize, Sequelize.JSON, 'customers', {
        defaultValue: []
      }),
      // 'Image'
      image: {
        type: Sequelize.STRING
      },
      // 'Image Alt'
      image_alt: {
        type: Sequelize.STRING
      }
    }
    return schema
  }
}
