/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('../utils/helpers')
const UNITS = require('../utils/enums').UNITS
const _ = require('lodash')

/**
 * @module Product
 * @description Product Model
 */
module.exports = class Product extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
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
              models.Product.hasMany(models.ProductImage, {
                as: 'images',
                // foreign_key: 'product_id',
                onDelete: 'CASCADE'
              })
              models.Product.hasMany(models.ProductVariant, {
                as: 'variants',
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
        //id

        // Multi-Site Support
        host: {
          type: Sequelize.STRING,
          defaultValue: 'localhost'
        },
        // Unique Name for the product
        handle: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },

        // Product Title
        title: {
          type: Sequelize.STRING
        },

        // Body (html or markdown)
        body: {
          type: Sequelize.TEXT
        },

        // SEO title
        seo_title: {
          type: Sequelize.STRING
        },

        // SEO description
        seo_description: {
          type: Sequelize.STRING
        },

        // Type of the product e.g. 'Snow Board'
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },

        // tags for the product
        tags: helpers.ARRAY('product', app, Sequelize, Sequelize.STRING, 'tags', {
          defaultValue: []
        }),

        // Metadata of the page (limit 1000 characters)
        metadata: helpers.JSONB('product', app, Sequelize, 'metadata', {
          defaultValue: {}
        }),

        // Default price of the product in cents
        price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },

        // Default currency of the product
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
        },

        // The sales channels in which the product is visible.
        published_scope: {
          type: Sequelize.STRING,
          defaultValue: 'global'
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

        // Options for the product (size, color, etc.)
        options: helpers.ARRAY('product', app, Sequelize, Sequelize.STRING, 'options', {
          defaultValue: []
        }),

        // Weight of the product, defaults to grams
        weight: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },

        // Unit of Measurement for Weight of the product, defaults to grams
        weight_unit: {
          type: Sequelize.ENUM(),
          values: _.values(UNITS),
          defaultValue: UNITS.G
        },

        // Vendor of the product
        vendor: {
          type: Sequelize.STRING
        }
      }
    }
    return schema
  }
}
