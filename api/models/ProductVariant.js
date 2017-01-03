/* eslint no-console: [0] */
/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
// const helpers = require('proxy-engine-helpers')
const UNITS = require('../utils/enums').UNITS
const INTERVALS = require('../utils/enums').INTERVALS
const INVENTORY_POLICY = require('../utils/enums').INVENTORY_POLICY
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
          underscored: true,
          // hooks: {
          //   beforeValidate: (values, options, fn) => {
          //     console.log('beforeCreate',values)
          //     fn()
          //   }
          // },
          defaultScope: {
            where: {
              live_mode: app.config.proxyCart.live_mode
            },
            order: [['position','ASC']]
          },
          classMethods: {
            /**
             * Expose UNITS enums
             */
            UNITS: UNITS,
            /**
             * Expose INTERVALS enums
             */
            INTERVALS: INTERVALS,
            /**
             * Expose INVENTORY_POLICY enums
             */
            INVENTORY_POLICY: INVENTORY_POLICY,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.ProductVariant.belongsTo(models.Product, {
                // onDelete: 'CASCADE'
              })
              // models.ProductVariant.belongsTo(models.Product, {
              //   // foreignKey: 'variant_id',
              //   // as: 'product_id',
              //   onDelete: 'CASCADE'
              //   // foreignKey: {
              //   //   allowNull: false
              //   // }
              // })
              models.ProductVariant.hasMany(models.ProductImage, {
                as: 'images',
                foreignKey: 'product_variant_id',
                through: null,
                onDelete: 'CASCADE'
                // foreignKey: {
                //   allowNull: false
                // }
              })
              // models.Product.belongsToMany(models.Collection, {
              //   as: 'collections',
              //   through: {
              //     model: models.ItemCollection,
              //     unique: false,
              //     scope: {
              //       model: 'product_variant'
              //     }
              //   },
              //   foreignKey: 'model_id',
              //   constraints: false
              // })
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
        // The SKU for this Variation
        sku: {
          type: Sequelize.STRING
        },
        // Variant Title
        title: {
          type: Sequelize.STRING
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
        // Competitor price of the variant in cents
        compare_at_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Default currency of the variant
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
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
          defaultValue: true
        },
        // If Product needs to be taxed
        requires_tax: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // If Variant requires a subscription
        requires_subscription: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // If Product has subscription, the interval of the subscription, defaults to 0 months
        subscription_interval: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // If product has subscription, the unit of the interval
        subscription_unit: {
          type: Sequelize.ENUM,
          values: _.values(INTERVALS),
          defaultValue: INTERVALS.NONE
        },
        // Specifies whether or not Shopify tracks the number of items in stock for this product variant.
        inventory_management: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // Specifies whether or not customers are allowed to place an order for a product variant when it's out of stock.
        inventory_policy: {
          type: Sequelize.ENUM,
          values: _.values(INVENTORY_POLICY),
          defaultValue: INVENTORY_POLICY.DENY
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
          type: Sequelize.ENUM,
          values: _.values(UNITS),
          defaultValue: UNITS.G
        },
        // If this product was created in Live Mode
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
