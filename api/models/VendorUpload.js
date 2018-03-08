/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

/**
 * @module VendorUpload
 * @description Vendor Upload
 */
module.exports = class VendorUpload extends Model {

  static config (app, Sequelize) {
    return {
      // migrate: 'drop', //override default models configurations if needed
      // store: 'uploads',
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
            options.regressive = options.regressive || false

            const recursiveQuery = function(options) {
              let count = 0
              return self.findAndCountAll(options)
                .then(results => {
                  count = results.count
                  return batch(results.rows)
                })
                .then(batched => {
                  if (count >= (options.regressive ? options.limit : options.offset + options.limit)) {
                    options.offset = options.regressive ? 0 : options.offset + options.limit
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
  }

  static schema (app, Sequelize) {
    return {
      // Upload ID
      upload_id: {
        type: Sequelize.STRING
      },
      // Handle
      handle: {
        type: Sequelize.STRING,
        allowNull: false,
        set: function(val) {
          this.setDataValue('handle', app.services.ProxyCartService.handle(val))
        }
      },
      // Name
      name: {
        type: Sequelize.STRING,
        set: function(val) {
          this.setDataValue('name', app.services.ProxyCartService.title(val))
        }
      },
      // Shipping Line 1
      shipping_address_1: {
        type: Sequelize.STRING
      },
      // Shipping Line 2
      shipping_address_2: {
        type: Sequelize.STRING
      },
      // Shipping Line 3
      shipping_address_3: {
        type: Sequelize.STRING
      },
      // Shipping Company
      shipping_company: {
        type: Sequelize.STRING
      },
      // Shipping City
      shipping_city: {
        type: Sequelize.STRING
      },
      // Shipping Province/State abbr
      shipping_province: {
        type: Sequelize.STRING
      },
      // Shipping Country Code iso-alpha-2
      shipping_country: {
        type: Sequelize.STRING
      },
      // Shipping Postal/Zip Code
      shipping_postal_code: {
        type: Sequelize.STRING
      },
      // Billing Line 1
      billing_address_1: {
        type: Sequelize.STRING
      },
      // Billing Line 2
      billing_address_2: {
        type: Sequelize.STRING
      },
      // Billing Line 3
      billing_address_3: {
        type: Sequelize.STRING
      },
      // Billing Company
      billing_company: {
        type: Sequelize.STRING
      },
      // Billing City
      billing_city: {
        type: Sequelize.STRING
      },
      // Billing Province/State abbr
      billing_province: {
        type: Sequelize.STRING
      },
      // Billing Country Code iso-alpha-2
      billing_country: {
        type: Sequelize.STRING
      },
      // Billing Postal/Zip Code
      billing_postal_code: {
        type: Sequelize.STRING
      },
      products: helpers.JSONB('VendorUpload', app, Sequelize, 'products', {
        defaultValue: []
      })
    }
  }
}
