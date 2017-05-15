/* eslint new-cap: [0] */
/* eslint no-console: [0] */

'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
/**
 * @module ProductUpload
 * @description Product Upload Model
 */
module.exports = class ProductUpload extends Model {

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
                  if (count > options.offset + options.limit) {
                    options.offset = options.offset + options.limit
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
      upload_id: {
        type: Sequelize.STRING
      },
      // 'Handle'
      handle: {
        type: Sequelize.STRING
      },
      // 'Title'
      title: {
        type: Sequelize.STRING
      },
      // 'Body'
      body: {
        type: Sequelize.STRING
      },
      // 'SEO Title'
      seo_title: {
        type: Sequelize.STRING
      },
      // 'SEO Description'
      seo_description: {
        type: Sequelize.STRING
      },
      // 'Vendors'
      vendors: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.JSON, 'vendors', {
        defaultValue: []
      }),
      // 'Type'
      type: {
        type: Sequelize.STRING
      },
      // 'Tags'
      tags: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.STRING, 'tags', {
        defaultValue: []
      }),
      // 'Collections'
      collections: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.STRING, 'collections', {
        defaultValue: []
      }),
      // 'Associations'
      associations: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.JSON, 'associations', {
        defaultValue: []
      }),
      // 'Published'
      published: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // { 'Option / * Name' : 'Option / * Value' }
      // options: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.JSON, 'options', {
      //   defaultValue: []
      // }),
      // { 'Option / * Name' : 'Option / * Value' }
      option: helpers.JSONB('ProductUpload', app, Sequelize, 'option', {
        // name: string, value:string
        defaultValue: {}
      }),
      // 'Images Sources'
      images: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.JSON, 'images', {
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
      },
      // 'Variant Inventory Policy'
      inventory_policy: {
        type: Sequelize.STRING
      },
      max_quantity: {
        type: Sequelize.INTEGER
      },
      // 'Variant Fulfillment Service'
      fulfillment_service: {
        type: Sequelize.STRING
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
        type: Sequelize.STRING,
        defaultValue: 'USD'
      },
      // 'Variant Requires Shipping'
      requires_shipping: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // 'Variant Taxable'
      taxable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // 'Variant Tax Code'
      tax_code: {
        type: Sequelize.STRING
      },
      // 'Variant Barcode'
      barcode: {
        type: Sequelize.STRING
      },
      // 'Variant Images'
      variant_images: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.JSON, 'variant_images', {
        defaultValue: []
      }),
      // 'Gift Card'
      gift_card: {
        type: Sequelize.STRING
      },
      // 'Metadata'
      metadata: {
        type: Sequelize.STRING
      },
      // 'Subscription'
      requires_subscription: {
        type: Sequelize.BOOLEAN
      },
      // 'Subscription Unit'
      subscription_unit: {
        type: Sequelize.STRING
      },
      // 'Subscription Interval'
      subscription_interval: {
        type: Sequelize.INTEGER
      },
      // 'Shops' Shop handles
      shops: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.STRING, 'shops', {
        defaultValue: []
      }),
      // 'Shops Quantity'
      shops_quantity: helpers.ARRAY('ProductUpload', app, Sequelize, Sequelize.INTEGER, 'shops_quantity', {
        defaultValue: []
      }),
      // 'Google Shopping / Google Product Category'
      g_product_category: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Gender'
      g_gender: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Age Group'
      g_age_group: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / MPN'
      g_mpn: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Adwords Grouping'
      g_adwords_grouping: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Adwords Labels'
      g_adwords_label: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Condition'
      g_condition: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Custom Product'
      g_custom_product: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Custom Label 0'
      g_custom_label_0: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Custom Label 1'
      g_custom_label_1: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Custom Label 2'
      g_custom_label_2: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Custom Label 3'
      g_custom_label_3: {
        type: Sequelize.STRING
      },
      // 'Google Shopping / Custom Label 4'
      g_custom_label_4: {
        type: Sequelize.STRING
      }
    }

    return schema
  }
}
