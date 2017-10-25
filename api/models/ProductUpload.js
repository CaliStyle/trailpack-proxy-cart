/* eslint new-cap: [0] */
/* eslint no-console: [0] */

'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
const INTERVALS = require('../../lib').Enums.INTERVALS
const INVENTORY_POLICY = require('../../lib').Enums.INVENTORY_POLICY
/**
 * @module ProductUpload
 * @description Product Upload Model
 */
module.exports = class ProductUpload extends Model {

  static config (app, Sequelize) {
    return {
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
            options.regressive = options.regressive || false

            const recursiveQuery = function(options) {
              let count = 0
              return self.findAndCount(options)
                .then(results => {
                  // console.log('Broke',results.count)
                  results.count.map(counts => {
                    count = count + 1
                  })
                  // count = results.count
                  return batch(results.rows)
                })
                .then(batched => {
                  // console.log('BROKE', count, options.offset + options.limit )
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
      upload_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // 'Handle'
      handle: {
        type: Sequelize.STRING,
        allowNull: false,
        set: function(val) {
          this.setDataValue('handle', app.services.ProxyCartService.handle(val))
        }
      },
      // 'Title'
      title: {
        type: Sequelize.STRING,
        set: function(val) {
          this.setDataValue('title', app.services.ProxyCartService.title(val))
        }
      },
      // 'Body'
      body: {
        type: Sequelize.TEXT
      },
      // 'SEO Title'
      seo_title: {
        type: Sequelize.STRING
      },
      // 'SEO Description'
      seo_description: {
        type: Sequelize.TEXT
      },
      // 'Vendors'
      vendors: helpers.JSONB('ProductUpload', app, Sequelize, 'vendors', {
        defaultValue: []
      }),
      // 'Type'
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // 'Tags'
      tags: helpers.JSONB('ProductUpload', app, Sequelize, 'tags', {
        defaultValue: []
      }),
      // 'Collections'
      collections: helpers.JSONB('ProductUpload', app, Sequelize, 'collections', {
        defaultValue: []
      }),
      // 'Associations'
      associations: helpers.JSONB('ProductUpload', app, Sequelize, 'associations', {
        defaultValue: []
      }),
      // 'Published'
      published: {
        type: Sequelize.BOOLEAN
        // defaultValue: true
      },
      // { 'Option / * Name' : 'Option / * Value' }
      // options: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.JSONB, 'options', {
      //   defaultValue: []
      // }),
      // { 'Option / * Name' : 'Option / * Value' }
      option: helpers.JSONB('ProductUpload', app, Sequelize, 'option', {
        // name: string, value:string
        defaultValue: {}
      }),
      // 'Images Sources'
      images: helpers.JSONB('ProductUpload', app, Sequelize, 'images', {
        defaultValue: []
      }),
      // 'Variant SKU'
      sku: {
        type: Sequelize.STRING
      },
      // 'Variant Weight'
      weight: {
        type: Sequelize.INTEGER
      },
      // 'Variant Weight Unit'
      weight_unit: {
        type: Sequelize.STRING
      },
      // 'Variant Inventory Tracker'
      inventory_tracker: {
        type: Sequelize.STRING
      },
      // 'Variant Inventory Quantity'
      inventory_quantity: {
        type: Sequelize.INTEGER
        // defaultValue: 0
      },
      // The average amount of days to come in stock if out of stock
      inventory_lead_time: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // 'Variant Inventory Policy'
      inventory_policy: {
        type: Sequelize.ENUM,
        values: _.values(INVENTORY_POLICY)
        // defaultValue: INVENTORY_POLICY.DENY
      },
      max_quantity: {
        type: Sequelize.INTEGER
        // defaultValue: -1
      },
      // 'Variant Fulfillment Service'
      fulfillment_service: {
        type: Sequelize.STRING
        // defaultValue: 'manual'
      },
      // 'Variant Price'
      price: {
        type: Sequelize.INTEGER
      },
      // 'Variant Compare at Price'
      compare_at_price: {
        type: Sequelize.INTEGER
      },
      // 'Variant Currency'
      variant_currency: {
        type: Sequelize.STRING
        // defaultValue: 'USD'
      },
      // 'Variant Requires Shipping'
      requires_shipping: {
        type: Sequelize.BOOLEAN
        // defaultValue: true
      },
      // 'Variant Taxable'
      taxable: {
        type: Sequelize.BOOLEAN
        // defaultValue: true
      },
      // 'Variant Tax Code'
      tax_code: {
        type: Sequelize.STRING
        // defaultValue: 'P000000' // Physical Good
      },
      // 'Variant Barcode'
      barcode: {
        type: Sequelize.STRING
      },
      // 'Variant Images'
      variant_images: helpers.JSONB('ProductUpload', app, Sequelize, 'variant_images', {
        defaultValue: []
      }),
      // 'Gift Card'
      gift_card: {
        type: Sequelize.STRING
      },
      // 'Metadata'
      metadata: {
        type: Sequelize.TEXT
      },
      // 'Subscription'
      requires_subscription: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // 'Subscription Unit'
      subscription_unit: {
        type: Sequelize.ENUM,
        values: _.values(INTERVALS)
        // defaultValue: INTERVALS.NONE
      },
      // 'Subscription Interval'
      subscription_interval: {
        type: Sequelize.INTEGER
        // defaultValue: 0
      },
      // 'Shops' Shop handles
      shops: helpers.JSONB('ProductUpload', app, Sequelize, 'shops', {
        defaultValue: []
      }),
      // 'Shops Quantity'
      shops_quantity: helpers.JSONB('ProductUpload', app, Sequelize, 'shops_quantity', {
        defaultValue: []
      }),

      // The Average Shipping Cost
      average_shipping: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      // Payment types that can not be used to purchase this product
      exclude_payment_types: helpers.JSONB('ProductUpload', app, Sequelize, 'exclude_payment_types', {
        defaultValue: []
      }),

      google: helpers.JSONB('ProductUpload', app, Sequelize, 'google', {
        defaultValue: {}
      }),

      amazon: helpers.JSONB('ProductUpload', app, Sequelize, 'amazon', {
        defaultValue: {}
      }),

      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
