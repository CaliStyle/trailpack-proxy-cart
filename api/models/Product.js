/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const UNITS = require('../utils/enums').UNITS
const _ = require('lodash')
const removeMd = require('remove-markdown')
const striptags = require('striptags')

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
          defaultScope: {
            where: {
              live_mode: app.config.proxyCart.live_mode
            }
          },
          hooks: {
            beforeValidate(values, options, fn) {
              if (!values.handle && values.title) {
                values.handle = values.title
              }
              fn()
            }
          },
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
              models.Product.belongsTo(models.Shop, {
                // as: 'shop_id'
              })
              models.Product.hasMany(models.ProductImage, {
                as: 'images',
                foreignKey: 'product_id',
                through: null,
                onDelete: 'CASCADE'
              })
              models.Product.hasMany(models.ProductVariant, {
                as: 'variants',
                foreignKey: 'product_id',
                through: null,
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
              models.Product.belongsToMany(models.Collection, {
                as: 'collections',
                through: {
                  model: models.ItemCollection,
                  unique: false,
                  scope: {
                    model: 'product'
                  },
                  foreignKey: 'model_id',
                  constraints: false
                }
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
              models.Product.belongsToMany(models.Collection, {
                as: 'collections',
                through: {
                  model: models.ItemCollection,
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
            findIdDefault: function(criteria, options) {
              options = _.merge(options, {
                include: [
                  {
                    model: app.orm['ProductImage'],
                    as: 'images',
                    order: ['position', 'ASC']
                  },
                  {
                    model: app.orm['Tag'],
                    as: 'tags',
                    attributes: ['name', 'id']
                  },
                  {
                    model: app.orm['ProductVariant'],
                    as: 'variants',
                    include: [
                      {
                        model: app.orm['ProductImage'],
                        as: 'images'
                      }
                    ]
                  },
                  {
                    model: app.orm['Metadata'],
                    as: 'metadata',
                    attributes: ['data', 'id']
                  },
                  {
                    model: app.orm['Collection'],
                    as: 'collections',
                    attributes: ['id', 'title', 'handle']
                  }
                  // app.orm['ProductVariant'].associations.variants
                ],
                order: [
                  [
                    {
                      model: app.orm['ProductVariant'],
                      as: 'variants'
                    },
                    'position'
                  ],
                  [
                    {
                      model: app.orm['ProductImage'],
                      as: 'images'
                    },
                    'position'
                  ]
                ]
              })
              return this.findById(criteria, options)
            },
            findAndCountDefault: function(options) {
              options = _.merge(options, {
                include: [
                  {
                    model: app.orm['ProductImage'],
                    as: 'images',
                    order: ['position', 'ASC']
                  },
                  {
                    model: app.orm['Tag'],
                    as: 'tags',
                    attributes: ['name', 'id']
                  },
                  {
                    model: app.orm['ProductVariant'],
                    as: 'variants',
                    include: [
                      {
                        model: app.orm['ProductImage'],
                        as: 'images'
                      }
                    ]
                  },
                  {
                    model: app.orm['Metadata'],
                    as: 'metadata',
                    attributes: ['data', 'id']
                  },
                  {
                    model: app.orm['Collection'],
                    as: 'collections',
                    attributes: ['id', 'title', 'handle']
                  }
                  // app.orm['ProductVariant'].associations.variants
                ],
                order: [
                  [
                    {
                      model: app.orm['ProductVariant'],
                      as: 'variants'
                    },
                    'position'
                  ],
                  [
                    {
                      model: app.orm['ProductImage'],
                      as: 'images'
                    },
                    'position'
                  ]
                ]
              })
              return this.findAndCount(options)
            }
          },
          instanceMethods: {
            toJSON: function() {
              const resp = this.get({ plain: true })
              // Transform Tags to array on toJSON
              if (resp.tags) {
                resp.tags = resp.tags.map(tag => {
                  if (_.isString(tag)) {
                    return tag
                  }
                  return tag.name
                })
              }
              // Transform Metadata to plain on toJSON
              if (resp.metadata) {
                if (typeof resp.metadata.data !== 'undefined') {
                  resp.metadata = resp.metadata.data
                }
              }
              return resp
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
          unique: true,
          set: function(val) {
            this.setDataValue('handle', app.services.ProxyCartService.slug(val))
          }
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
          type: Sequelize.STRING,
          set: function(val) {
            this.setDataValue('seo_title', removeMd(striptags(val)))
          }
        },
        // SEO description
        seo_description: {
          type: Sequelize.STRING,
          set: function(val) {
            this.setDataValue('seo_description', removeMd(striptags(val)))
          }
        },
        // Type of the product e.g. 'Snow Board'
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The tax code of the product, defaults to physical good.
        tax_code: {
          type: Sequelize.STRING,
          defaultValue: 'P000000' // Physical Good
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
          type: Sequelize.ENUM,
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
        },

        // Live Mode
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
