/* eslint new-cap: [0] */

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
        underscored: true
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
      // 'Vendor'
      vendor: {
        type: Sequelize.STRING
      },
      // 'Type'
      type: {
        type: Sequelize.STRING
      },
      // 'Tags'
      tags: helpers.ARRAY('productupload', app, Sequelize, Sequelize.STRING, 'tags', {
        defaultValue: []
      }),
      // 'Published'
      published: {
        type: Sequelize.STRING
      },
      // { 'Option / * Name' : 'Option / * Value' }
      options: helpers.ARRAY('productupload', app, Sequelize, Sequelize.STRING, 'options', {
        defaultValue: []
      }),
      // 'Images Sources'
      images: helpers.ARRAY('productupload', app, Sequelize, Sequelize.STRING, 'images', {
        defaultValue: []
      }),
      // 'Variant SKU'
      sku: {
        type: Sequelize.STRING
      },
      // 'Variant Weight'
      weight: {
        type: Sequelize.STRING
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
        type: Sequelize.STRING
      },
      // 'Variant Inventory Policy'
      inventory_policy: {
        type: Sequelize.STRING
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
        type: Sequelize.STRING,
        defaultValue: true
      },
      // 'Variant Taxable'
      taxable: {
        type: Sequelize.STRING,
        defaultValue: true
      },
      // 'Variant Barcode'
      barcode: {
        type: Sequelize.STRING
      },
      // 'Variant Images'
      variant_images: helpers.ARRAY('productupload', app, Sequelize, Sequelize.STRING, 'variant_images', {
        defaultValue: []
      }),
      // 'Variant Tax Code'
      tax_code: {
        type: Sequelize.STRING
      },
      // 'Gift Card'
      gift_card: {
        type: Sequelize.STRING
      },
      // 'Metadata'
      metadata: {
        type: Sequelize.STRING
      },
      // 'Subscription'
      subscription: {
        type: Sequelize.STRING
      },
      // 'Subscription Unit'
      subscription_unit: {
        type: Sequelize.STRING
      },
      // 'Subscription Interval'
      subscription_interval: {
        type: Sequelize.STRING
      },
      // 'Collection'
      collection: {
        type: Sequelize.STRING
      },
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
