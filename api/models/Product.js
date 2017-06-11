/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
const UNITS = require('../utils/enums').UNITS
const PRODUCT_DEFAULTS = require('../utils/enums').PRODUCT_DEFAULTS
const queryDefaults = require('../utils/queryDefaults')
const _ = require('lodash')
const removeMd = require('remove-markdown')
const striptags = require('striptags')
// const Errors = require('proxy-engine-errors')

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
          // paranoid: !app.config.proxyCart.allow.destroy_product,
          defaultScope: {
            where: {
              live_mode: app.config.proxyEngine.live_mode
            }
            // paranoid: false
          },
          hooks: {
            beforeValidate(values, options, fn) {
              if (!values.handle && values.title) {
                values.handle = values.title
              }
              if (!values.calculated_price && values.price) {
                values.calculated_price = values.price
              }
              fn()
            },
            beforeCreate(values, options, fn) {
              app.services.ProductService.beforeCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            beforeUpdate(values, options, fn) {
              app.services.ProductService.beforeUpdate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            }
          },
          classMethods: {
            /**
             * Expose UNITS enums
             */
            UNITS: UNITS,
            PRODUCT_DEFAULTS: PRODUCT_DEFAULTS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Product.belongsToMany(models.Shop, {
                as: 'shops',
                through: 'ShopProduct'
              })
              models.Product.hasMany(models.ProductImage, {
                as: 'images',
                foreignKey: 'product_id',
                through: null,
                onDelete: 'CASCADE'
              })
              // models.Product.belongsToMany(models.Image, {
              //   as: 'images',
              //   through: {
              //     model: models.ItemImage,
              //     unique: false,
              //     scope: {
              //       model: 'product'
              //     }
              //   },
              //   foreignKey: 'model_id',
              //   constraints: false
              // })
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
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              models.Product.belongsToMany(models.Coupon, {
                as: 'coupons',
                through: {
                  model: models.ItemCoupon,
                  unique: false,
                  scope: {
                    model: 'product'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              models.Product.hasOne(models.Metadata, {
                as: 'metadata',
                through: {
                  model: models.ItemMetadata,
                  unique: false,
                  scope: {
                    model: 'product'
                  }
                },
                // foreignKey: 'model_id',
                // constraints: false
              })
              models.Product.belongsToMany(models.Vendor, {
                as: 'vendors',
                through: {
                  model: models.VendorProduct,
                  unique: false,
                },
                foreignKey: 'product_id',
                // constraints: false
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
              models.Product.belongsToMany(models.Product, {
                as: 'associations',
                through: {
                  model: models.ProductAssociation,
                  unique: false
                  // scope: {
                  //   model: 'product'
                  // }
                },
                foreignKey: 'associated_product_id',
                constraints: false
              })
              models.Product.belongsToMany(models.Discount, {
                as: 'discount_codes',
                through: {
                  model: models.ItemDiscount,
                  unique: false,
                  scope: {
                    model: 'product'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              // models.Product.belongsTo(models.Vendor, {
              //   as: 'vendor',
              //   // foreignKey: 'id',
              //   // onDelete: 'CASCADE'
              //   // foreignKey: {
              //   //   allowNull: false
              //   // }
              // })
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
            findByIdDefault: function(criteria, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Product.default(app))
              // console.log('Product.findByIdDefault', options)
              // console.log(criteria, options)
              let resProduct
              return this.findById(criteria, options)
                .then(product => {
                  if (!product) {
                    // throw new Errors.FoundError(Error(`${criteria} not found`))
                  }
                  resProduct = product
                  if (resProduct && options.req && options.req.customer) {
                    return app.services.CollectionService.customerCollections(options.req.customer, [resProduct])
                      .then(collections => {
                        return resProduct.collections = collections
                      })
                  }
                  else if (resProduct) {
                    return app.services.CollectionService.customerCollections(null, [resProduct])
                      .then(collections => {
                        return resProduct.collections = collections
                      })
                  }
                  else {
                    return []
                  }
                })
                .then(collections => {
                  if (resProduct) {
                    return resProduct.calculate()
                  }
                  else {
                    return resProduct
                  }
                })
            },
            findByHandleDefault: function(handle, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Product.default(app), {
                where: {
                  handle: handle
                }
              })
              let resProduct
              return this.findOne(options)
                .then(product => {
                  if (!product) {
                    // throw new Errors.FoundError(Error(`${handle} not found`))
                  }
                  resProduct = product
                  if (resProduct && options.req && options.req.customer) {
                    return app.services.CollectionService.customerCollections(options.req.customer, [resProduct])
                      .then(collections => {
                        return resProduct.collections = collections
                      })
                  }
                  else if (resProduct) {
                    return app.services.CollectionService.customerCollections(null, [resProduct])
                      .then(collections => {
                        return resProduct.collections = collections
                      })
                  }
                  else {
                    return []
                  }
                })
                .then(collections => {
                  if (resProduct) {
                    return resProduct.calculate()
                  }
                  else {
                    return resProduct
                  }
                })
            },
            findOneDefault: function(criteria, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Product.default(app))
              // console.log('Product.findOneDefault', options)
              let resProduct
              return this.findOne(criteria, options)
                .then(product => {
                  if (!product) {
                    // resProduct = app.orm['Product'].build()
                    // throw new Errors.FoundError(Error(`${criteria} not found`))
                  }
                  resProduct = product
                  if (resProduct && options.req && options.req.customer) {
                    return app.services.CollectionService.customerCollections(options.req.customer, [resProduct])
                      .then(collections => {
                        // return resProduct.collections = collections
                        return resProduct.set('collections', collections, {raw: true})
                      })
                  }
                  else if (resProduct) {
                    return app.services.CollectionService.customerCollections(null, [resProduct])
                      .then(collections => {
                        // return resProduct.collections = collections
                        return resProduct.set('collections', collections, {raw: true})
                      })
                  }
                  else {
                    return resProduct.set('collections', [], {raw: true})
                  }
                })
                .then(collections => {
                  if (resProduct) {
                    return resProduct.calculate()
                  }
                  else {
                    return resProduct
                  }

                })
            },
            /**
             *
             * @param options
             * @returns {*|Promise.<Array.<Instance>>}
             */
            findAllDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Product.default(app))
              return this.findAll(options)
            },
            /**
             *
             * @param options
             * @returns {Promise.<Object>}
             */
            findAndCountDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Product.default(app))
              return this.findAndCount(options)
            },
            /**
             *
             * @param product
             * @param options
             * @returns {*}
             */
            resolve: function(product, options){
              options = options || {}
              const Product =  this

              if (product instanceof Product.Instance){
                return Promise.resolve(product)
              }
              else if (product && _.isObject(product) && product.id) {
                return Product.findById(product.id, options)
                  .then(resProduct => {
                    if (!resProduct) {
                      throw new Errors.FoundError(Error(`Product ${product.id} not found`))
                    }
                    return resProduct
                  })
              }
              else if (product && _.isObject(product) && product.handle) {
                return Product.findOne(_.defaultsDeep({
                  where: { handle: product.handle }
                }, options))
                  .then(resProduct => {
                    if (!resProduct) {
                      throw new Errors.FoundError(Error(`Product ${product.handle} not found`))
                    }
                    return resProduct
                  })
              }
              else if (product && (_.isString(product) || _.isNumber(product))) {
                return Product.findById(product, options)
                  .then(resProduct => {
                    if (!resProduct) {
                      throw new Errors.FoundError(Error(`Product ${product} not found`))
                    }
                    return resProduct
                  })
              }
              else {
                // TODO create proper error
                const err = new Error(`Unable to resolve Product ${product}`)
                return Promise.reject(err)
              }
            }
          },
          instanceMethods: {
            calculate: function () {
              if (!this) {
                return
              }
              // Set defaults
              this.calculated_price = this.price
              // Modify defaults
              app.services.DiscountService.calculateProduct(this, this.collections)
              return this
            },
            toJSON: function() {
              // Make JSON
              const resp = this.get({ plain: true })
              // Set Defaults
              // resp.calculated_price = resp.price

              // Transform Tags to array on toJSON
              if (resp.tags) {
                // console.log(resp.tags)
                resp.tags = resp.tags.map(tag => {
                  if (tag && _.isString(tag)) {
                    return tag
                  }
                  else if (tag && tag.name && tag.name !== '') {
                    return tag.name
                  }
                })
              }
              // Map Variants as Products are mapped
              if (resp.variants) {
                resp.variants.map((variant, idx) => {
                  if (variant.tags) {
                    resp.variants[idx].tags = variant.tags.map(tag => {
                      if (tag && _.isString(tag)) {
                        return tag
                      }
                      else if (tag && tag.name) {
                        return tag.name
                      }
                    })
                  }
                  if (variant.metadata) {
                    if (typeof variant.metadata.data !== 'undefined') {
                      resp.variants[idx].metadata = variant.metadata.data
                    }
                  }
                  // Set Defaults
                  resp.variants[idx].calculated_price = variant.price
                  // TODO loop through collections and produce calculated price

                })
              }
              // Transform Metadata to plain on toJSON
              if (resp.metadata) {
                if (typeof resp.metadata.data !== 'undefined') {
                  resp.metadata = resp.metadata.data
                }
              }
              // Transform Vendors to strings
              if (resp.vendors) {
                // console.log(resp.vendors)
                resp.vendors = resp.vendors.map(vendor => {
                  if (vendor && _.isString(vendor)) {
                    return vendor
                  }
                  else {
                    return vendor.name
                  }
                })
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
          defaultValue: PRODUCT_DEFAULTS.HOST
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
        // The body of a product (in markdown or html)
        body: {
          type: Sequelize.TEXT
        },
        // The html of a product (DO NOT EDIT DIRECTLY)
        html: {
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
          type: Sequelize.TEXT,
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
          defaultValue: PRODUCT_DEFAULTS.TAX_CODE // Physical Good
        },
        // TODO convert to Model tags for the product
        // Default price of the product in cents
        price: {
          type: Sequelize.INTEGER,
          defaultValue: PRODUCT_DEFAULTS.PRICE
        },
        calculated_price: {
          type: Sequelize.INTEGER,
          defaultValue: PRODUCT_DEFAULTS.CALCULATED_PRICE
        },
        discounted_lines: helpers.ARRAY('Product', app, Sequelize, Sequelize.JSON, 'discounted_lines', {
          defaultValue: PRODUCT_DEFAULTS.DISCOUNTED_LINES
        }),
        total_discounts: {
          type: Sequelize.INTEGER,
          defaultValue: PRODUCT_DEFAULTS.TOTAL_DISCOUNTS
        },
        // Default currency of the product
        currency: {
          type: Sequelize.STRING,
          defaultValue: PRODUCT_DEFAULTS.CURRENCY
        },
        // The sales channels in which the product is visible.
        published_scope: {
          type: Sequelize.STRING,
          defaultValue: PRODUCT_DEFAULTS.PUBLISHED_SCOPE
        },
        // Is product published
        published: {
          type: Sequelize.BOOLEAN,
          defaultValue: PRODUCT_DEFAULTS.PUBLISHED
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
        options: helpers.ARRAY('Product', app, Sequelize, Sequelize.STRING, 'options', {
          defaultValue: PRODUCT_DEFAULTS.OPTIONS
        }),
        // Weight of the product, defaults to grams
        weight: {
          type: Sequelize.INTEGER,
          defaultValue: PRODUCT_DEFAULTS.WEIGHT
        },
        // Unit of Measurement for Weight of the product, defaults to grams
        weight_unit: {
          type: Sequelize.ENUM,
          values: _.values(UNITS),
          defaultValue: PRODUCT_DEFAULTS.WEIGHT_UNIT
        },
        // The Average Score of Reviews
        review_score: {
          type: Sequelize.INTEGER,
          defaultValue: PRODUCT_DEFAULTS.REVIEWS_SCORE
        },
        // The Total Reviews of the Product
        total_reviews: {
          type: Sequelize.INTEGER,
          defaultValue: PRODUCT_DEFAULTS.TOTAL_REVIEWS
        },

        // The Total variants
        total_variants: {
          type: Sequelize.INTEGER,
          defaultValue: PRODUCT_DEFAULTS.TOTAL_VARIANTS
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
          defaultValue: app.config.proxyEngine.live_mode
        }
      }
    }
    return schema
  }
}
