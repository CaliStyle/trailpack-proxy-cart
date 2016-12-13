/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
// const helpers = require('../utils/helpers')
const UNITS = require('../utils/enums').UNITS
const _ = require('lodash')

/**
 * @module ProductVariant
 * @description Product Variant Model
 */
module.exports = class ProductVariant extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          classMethods: {
            /**
             * Expose UNITS enums
             */
            UNITS: UNITS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.ProductVariant.belongsTo(models.Product, {
                as: 'product_id',
                onDelete: 'CASCADE'
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
        // Variant Title
        title: {
          type: Sequelize.STRING
        },

        // The Unique SKU for this Variation
        sku: {
          type: Sequelize.STRING,
          unique: true
        },

        // The Barcode of the Variant
        barcode: {
          type: Sequelize.STRING
        },

        // Default price of the product in cents
        price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },

        // Competitor price of the product in cents
        compare_at_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },

        // The fulfillment generic that handles this request
        fulfillment_service: {
          type: Sequelize.STRING,
          defaultValue: 'manual'
        },

        // The order of the product variant in the list of product variants.
        position: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        },

        // Is product published
        published: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        // Date/Time the Product was published
        published_at: {
          type: Sequelize.DATE
        },

        // Date/Time the Product was unpublished
        unpublished_at: {
          type: Sequelize.DATE
        },

        // If Variant needs to be shipped
        requires_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        // If Product needs to be taxed
        requires_tax: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        // Specifies whether or not Shopify tracks the number of items in stock for this product variant.
        inventory_management: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        // Specifies whether or not customers are allowed to place an order for a product variant when it's out of stock.
        inventory_policy: {
          type: Sequelize.STRING
        },

        // Amount of variant in inventory
        inventory_quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },

        // Weight of the variant, defaults to grams
        weight: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },

        // Unit of Measurement for Weight of the variant, defaults to grams
        weight_unit: {
          type: Sequelize.ENUM(),
          values: _.values(UNITS),
          defaultValue: UNITS.G
        }
      }
    }
    return schema
  }
}
