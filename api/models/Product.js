/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
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
              // models.Product.belongsTo(models.Shop, {
              //   // as: 'shop_id',
              //   // foreignKey: 'shop_id'
              // })
              models.Product.hasMany(models.ProductImage, {
                as: 'images',
                onDelete: 'CASCADE'
              })
              models.Product.hasMany(models.ProductVariant, {
                as: 'variants',
                onDelete: 'CASCADE'
              })
              // models.Product.hasMany(models.ProductReview, {
              //   as: 'reviews',
              //   onDelete: 'CASCADE'
              // })
              // models.Product.hasOne(models.Metadata, {
              //   as: 'metadata',
              //   onDelete: 'CASCADE'
              // })
              // models.Product.belongsToMany(models.Cart, {
              //   as: 'carts',
              //   through: 'CartProduct'
              // })
              models.Product.belongsToMany(models.ProductCollection, {
                as: 'collections',
                through: 'ProductCollectionProduct'
              })
              models.Product.hasOne(models.Metadata, {
                as: 'metadata',
                through: {
                  model: models.ItemMetadata,
                  unique: false,
                  scope: {
                    model: 'product'
                  },
                  foreignKey: 'model_id',
                  constraints: false
                }
              })
              models.Product.belongsToMany(models.Tag, {
                as: 'tags',
                through: {
                  model: models.ItemTag,
                  unique: false,
                  scope: {
                    model: 'product'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              // models.Product.belongsToMany(models.OrderItem, {
              //   as: 'order_items',
              //   through: 'OrderItemProduct'
              // })
              // models.Product.belongsToMany(models.Cart, {
              //   through: {
              //     model: CartProduct,
              //     unique: false,
              //     scope: {
              //       taggable: 'post'
              //     }
              //   },
              //   foreignKey: 'taggable_id',
              //   constraints: false
              // })
            },
            findOneDefault: (id, options) => {
              options = _.merge(options, {
                include: [
                  {
                    model: app.orm['ProductImage'],
                    as: 'images'
                  },
                  {
                    model: app.orm['Tag'],
                    as: 'tags',
                    attributes: ['name', 'id']
                  },
                  {
                    model: app.orm['ProductVariant'],
                    as: 'variants'
                    // include: [
                    //   {
                    //     model: app.orm['ProductImage'],
                    //     as: 'images'
                    //   }
                    // ]
                  }
                ]
              })
              return app.orm['Product'].findById(id, options)
                .then(product => {
                  const resProduct = product.get({plain: true})
                  resProduct.tags = app.orm['Tag'].reverseTransformTags(resProduct.tags)
                  return resProduct
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

        // TODO Multi-Site Support. Change to domain?
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
        // TODO convert to Model tags for the product
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
        },
        // The Average Score of Reviews
        review_score: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The Total Reviews of the Product
        total_reviews: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
