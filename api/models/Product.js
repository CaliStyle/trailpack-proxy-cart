/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
const UNITS = require('../../lib').Enums.UNITS
const PRODUCT_DEFAULTS = require('../../lib').Enums.PRODUCT_DEFAULTS
const queryDefaults = require('../utils/queryDefaults')
const _ = require('lodash')
// const Errors = require('proxy-engine-errors')

/**
 * @module Product
 * @description Product Model
 */
module.exports = class Product extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        // paranoid: !app.config.proxyCart.allow.destroy_product,
        // defaultScope: {
        //   where: {
        //     live_mode: app.config.proxyEngine.live_mode
        //   }
        //   // paranoid: false
        // },
        scopes: {
          live: {
            where: {
              live_mode: true
            }
          },
          published: {
            where: {
              published: true
            }
          }
        },
        hooks: {
          beforeValidate(values, options) {
            if (!values.handle && values.title) {
              values.handle = values.title
            }
            if (!values.calculated_price && values.price) {
              values.calculated_price = values.price
            }
            if (!values.compare_at_price && values.price) {
              values.compare_at_price = values.price
            }
          },
          beforeCreate(values, options) {
            return app.services.ProductService.beforeCreate(values, options)
              .catch(err => {
                return Promise.reject(err)
              })
          },
          beforeUpdate(values, options) {
            return app.services.ProductService.beforeUpdate(values, options)
              .catch(err => {
                return Promise.reject(err)
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
            // models.Product.belongsToMany(models.Shop, {
            //   as: 'shops',
            //   through: 'ShopProduct'
            // })
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
              // through: null,
              onDelete: 'CASCADE'
            })
            models.Product.hasMany(models.ProductReview, {
              as: 'reviews',
              foreignKey: 'product_id',
              onDelete: 'CASCADE'
            })
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
              // scope: {
              //   model: 'product'
              // },
              foreignKey: 'product_id'
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
            models.Product.belongsToMany(models.Shop, {
              as: 'shops',
              through: {
                model: models.ShopProduct,
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
              otherKey: 'tag_id',
              constraints: false
            })
            // models.Product.belongsToMany(models.Collection, {
            //   as: 'collections',
            //   through: {
            //     model: models.ItemCollection,
            //     unique: false,
            //     scope: {
            //       model: 'product'
            //     }
            //   },
            //   foreignKey: 'model_id',
            //   otherKey: 'collection_id',
            //   constraints: false
            // })
            models.Product.belongsToMany(models.Product, {
              as: 'associations',
              through: {
                model: models.ProductAssociation,
                unique: false
              },
              foreignKey: 'product_id',
              otherKey: 'associated_product_id',
              // constraints: false
            })
            models.Product.belongsToMany(models.Product, {
              as: 'relations',
              through: {
                model: models.ProductAssociation,
                unique: false
              },
              foreignKey: 'associated_product_id',
              otherKey: 'product_id',
              // constraints: false
            })
            models.Product.belongsToMany(models.Discount, {
              as: 'discounts',
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
            models.Product.belongsToMany(models.Event, {
              as: 'event_items',
              through: {
                model: models.EventItem,
                unique: false,
                scope: {
                  object: 'product'
                }
              },
              foreignKey: 'object_id',
              constraints: false
            })
          },
          /**
           *
           * @param criteria
           * @param options
           * @returns {Promise.<TResult>}
           */
          findByIdDefault: function(criteria, options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Product.default(app),
              options || {}
            )
            // console.log('Product.findByIdDefault', options)
            // console.log(criteria, options)
            let resProduct
            return this.findById(criteria, options)
              .then(product => {
                resProduct = product

                if (resProduct) {
                  return resProduct.resolveReqCollections(options)
                }
                else {
                  return
                }
              })
              .then(() => {
                if (resProduct && options.req && options.req.customer) {
                  return resProduct.getCustomerHistory(options.req.customer, {
                    transaction: options.transaction || null
                  })
                }
                else {
                  return
                }
              })
              .then(() => {
                if (resProduct) {
                  return resProduct.calculate({transaction: options.transaction || null})
                }
                else {
                  return resProduct
                }
              })
          },
          /**
           *
           * @param handle
           * @param options
           * @returns {Promise.<TResult>}
           */
          findByHandleDefault: function(handle, options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Product.default(app),
              options || {},
              {
                where: {
                  handle: handle
                }
              }
            )
            let resProduct
            return this.findOne(options)
              .then(product => {
                resProduct = product

                if (resProduct) {
                  return resProduct.resolveReqCollections(options)
                }
                else {
                  return
                }
              })
              .then(() => {
                if (resProduct && options.req && options.req.customer) {
                  return resProduct.getCustomerHistory(options.req.customer, {
                    transaction: options.transaction || null
                  })
                }
                else {
                  return
                }
              })
              .then(() => {
                if (resProduct) {
                  return resProduct.calculate({transaction: options.transaction || null})
                }
                else {
                  return resProduct
                }
              })
          },
          /**
           *
           * @param criteria
           * @param options
           * @returns {Promise.<TResult>}
           */
          findOneDefault: function(criteria, options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Product.default(app),
              options || {}
            )
            // console.log('Product.findOneDefault', options)
            let resProduct
            return this.findOne(criteria, options)
              .then(product => {
                if (!product) {
                  // resProduct = app.orm['Product'].build()
                  // throw new Errors.FoundError(Error(`${criteria} not found`))
                }
                resProduct = product

                if (resProduct) {
                  return resProduct.resolveReqCollections(options)
                }
                else {
                  return
                }
              })
              .then(() => {
                if (resProduct && options.req && options.req.customer) {
                  return resProduct.getCustomerHistory(options.req.customer, {
                    transaction: options.transaction || null
                  })
                }
                else {
                  return
                }
              })
              .then(() => {
                if (resProduct) {
                  return resProduct.calculate({transaction: options.transaction || null})
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
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Product.findAllDefault(app),
              options || {}
            )
            return this.findAll(options)
          },
          /**
           *
           * @param options
           * @returns {Promise.<Object>}
           */
          findAndCountDefault: function(options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Product.findAllDefault(app),
              options || {}
            )
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

            if (product instanceof Product){
              return Promise.resolve(product)
            }
            else if (product && _.isObject(product) && product.id) {
              return Product.findById(product.id, options)
                .then(resProduct => {
                  if (!resProduct) {
                    throw new Errors.FoundError(Error(`Product id ${product.id} not found`))
                  }
                  return resProduct
                })
            }
            else if (product && _.isObject(product) && product.handle) {
              return Product.findOne(app.services.ProxyEngineService.mergeOptionDefaults({
                where: {
                  handle: product.handle
                }
              }, options))
                .then(resProduct => {
                  if (!resProduct) {
                    throw new Errors.FoundError(Error(`Product handle ${product.handle} not found`))
                  }
                  return resProduct
                })
            }
            else if (product && _.isNumber(product)) {
              return Product.findById(product, options)
                .then(resProduct => {
                  if (!resProduct) {
                    throw new Errors.FoundError(Error(`Product id ${product} not found`))
                  }
                  return resProduct
                })
            }
            else if (product && _.isString(product)) {
              return Product.findOne(app.services.ProxyEngineService.mergeOptionDefaults({
                options,
                where: { handle: product }
              }))
                .then(resProduct => {
                  if (!resProduct) {
                    throw new Errors.FoundError(Error(`Product handle ${product} not found`))
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
          /**
           *
           * @param lines
           */
          setDiscountedLines: function(lines) {
            let totalDiscounts = 0
            this.discounted_lines = lines
            _.each(this.discounted_lines, line => {
              totalDiscounts = totalDiscounts + line.price
            })
            this.total_discounts = totalDiscounts
            return this
          },

          setCalculatedPrice: function(calculatedPrice) {
            this.calculated_price = calculatedPrice
            return this
          },

          getCustomerHistory: function(customer, options) {
            options = options || {}
            let hasPurchaseHistory = false, isSubscribed = false
            return this.hasPurchaseHistory(customer.id, options)
              .then(pHistory => {
                hasPurchaseHistory = pHistory
                return this.isSubscribed(customer.id, options)
              })
              .then(pHistory => {
                isSubscribed = pHistory
                this.setDataValue('has_purchase_history', hasPurchaseHistory)
                this.setDataValue('is_subscribed', isSubscribed)
                return this
              })
              .catch(err => {
                this.setDataValue('has_purchase_history', hasPurchaseHistory)
                this.setDataValue('is_subscribed', isSubscribed)
                return this
              })
          },
          /**
           *
           * @param customerId
           * @param options
           * @returns {Promise.<boolean>}
           */
          hasPurchaseHistory: function(customerId, options) {
            options = options || {}
            return app.orm['OrderItem'].findOne({
              where: {
                customer_id: customerId,
                product_id: this.id,
                fulfillment_status: {
                  $not: ['cancelled','pending','none']
                }
              },
              attributes: ['id'],
              transaction: options.transaction || null
            })
              .then(pHistory => {
                if (pHistory) {
                  return true
                }
                else {
                  return false
                }
              })
              .catch(err => {
                return false
              })
          },
          isSubscribed: function(customerId, options) {
            options = options || {}
            return app.orm['Subscription'].findOne({
              where: {
                customer_id: customerId,
                active: true,
                line_items: {
                  $contains: [{
                    product_id: this.id
                  }]
                }
              },
              attributes: ['id'],
              transaction: options.transaction || null
            })
              .then(pHistory => {
                if (pHistory) {
                  return true
                }
                else {
                  return false
                }
              })
              .catch(err => {
                return false
              })
          },
          calculate: function (options) {
            options = options || {}
            if (!this) {
              return
            }
            // Set defaults
            this.calculated_price = this.price

            // Modify defaults
            app.services.DiscountService.calculateCollections(
              this,
              this.collections,
              app.orm['Product'],
              {transaction: options.transaction || null}
            )

            //obj, collections, resolver, options

            return this
          },
          /**
           *
           * @param colsB
           * @returns Instance
           */
          mergeIntoCollections: function(colsB) {
            colsB = colsB || []

            const collections = _.map(this.collections, (item) => {
              return _.extend(item, _.find(colsB, { id: item.id }))
            })

            this.collections = collections
            this.setDataValue('collections', collections)
            this.set('collections', collections)
            return this
          },
          /**
           * TODO, this should likely be done with a view
           * Format return data
           * Converts tags to array of strings
           * Converts any nested variant tags to array of strings
           * Returns only metadata data
           * Converts vendors to array of strings
           */
          toJSON: function() {
            // Make JSON
            const resp = this instanceof app.orm['Product'] ? this.get({ plain: true }) : this
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
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveVariants: function(options) {
            options = options || {}
            if (
              this.variants
              && this.variants.every(v => v instanceof app.orm['ProductVariant'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getVariants({transaction: options.transaction || null})
                .then(variants => {
                  variants = variants || []
                  this.variants = variants
                  this.setDataValue('variants', variants)
                  this.set('variants', variants)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveAssociations: function(options) {
            options = options || {}
            if (
              this.associations
              && this.associations.every(p => p instanceof app.orm['Product'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getAssociations({transaction: options.transaction || null})
                .then(associations => {
                  associations = associations || []
                  this.associations = associations
                  this.setDataValue('associations', associations)
                  this.set('associations', associations)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveImages: function(options) {
            options = options || {}
            if (
              this.images
              && this.images.every(i => i instanceof app.orm['ProductImage'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getImages({transaction: options.transaction || null})
                .then(images => {
                  images = images || []
                  this.images = images
                  this.setDataValue('images', images)
                  this.set('images', images)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveVendors: function(options) {
            options = options || {}
            if (
              this.vendors
              && this.vendors.every(v => v instanceof app.orm['Vendor'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getVendors({transaction: options.transaction || null})
                .then(vendors => {
                  vendors = vendors || []
                  this.vendors = vendors
                  this.setDataValue('vendors', vendors)
                  this.set('vendors', vendors)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveMetadata: function(options) {
            options = options || {}
            if (
              this.metadata
              && this.metadata instanceof app.orm['Metadata']
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getMetadata({transaction: options.transaction || null})
                .then(_metadata => {
                  _metadata = _metadata || {product_id: this.id}
                  this.metadata = _metadata
                  this.setDataValue('metadata', _metadata)
                  this.set('metadata', _metadata)
                  return this
                })
            }
          },

          /**
           *
           * @param options
           * @returns {*}
           */
          resolveShops: function(options) {
            options = options || {}
            if (
              this.shops
              && this.shops.length > 0
              && this.shops.every(d => d instanceof app.orm['Shop'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getShops({transaction: options.transaction || null})
                .then(shops => {
                  shops = shops || []
                  this.shops = shops
                  this.setDataValue('shops', shops)
                  this.set('shops', shops)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveTags: function(options) {
            options = options || {}
            if (
              this.tags
              && this.tags.length > 0
              && this.tags.every(t => t instanceof app.orm['Tag'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getTags({transaction: options.transaction || null})
                .then(tags => {
                  tags = tags || []
                  this.tags = tags
                  this.setDataValue('tags', tags)
                  this.set('tags', tags)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {Promise.<TResult>}
           */
          resolveReqCollections: function(options) {
            options = options || {}

            return Promise.resolve()
              .then(() => {
                return this.resolveCollections({transaction: options.transaction || null})
              })
              .then(() => {
                if (options.req && options.req.customer) {
                  return options.req.customer.resolveCollections({transaction: options.transaction || null})
                }
                else {
                  return {collections: []}
                }
              })
              .then(customer => {
                return this.mergeIntoCollections(customer.collections)
              })
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveCollections: function(options) {
            options = options || {}
            if (
              this.collections
              && this.collections.length > 0
              && this.collections.every(c => c instanceof app.orm['Collection'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getCollections({transaction: options.transaction || null})
                .then(collections => {
                  collections = collections || []
                  this.collections = collections
                  this.setDataValue('collections', collections)
                  this.set('collections', collections)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveCoupons: function(options) {
            options = options || {}
            if (
              this.coupons
              && this.coupons.length > 0
              && this.coupons.every(c => c instanceof app.orm['Coupon'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getCoupons({transaction: options.transaction || null})
                .then(coupons => {
                  coupons = coupons || []
                  this.coupons = coupons
                  this.setDataValue('coupons', coupons)
                  this.set('coupons', coupons)
                  return this
                })
            }
          },
          /**
           *
           * @param options
           * @returns {Promise.<T>}
           */
          resolveDiscounts(options) {
            options = options || {}
            if (
              this.discounts
              && this.discounts.length > 0
              && this.discounts.every(d => d instanceof app.orm['Discount'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getDiscounts({transaction: options.transaction || null})
                .then(_discounts => {
                  _discounts = _discounts || []
                  this.discounts = _discounts
                  this.setDataValue('discounts', _discounts)
                  this.set('discounts', _discounts)
                  return this
                })
            }
          },
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
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
          this.setDataValue('handle', app.services.ProxyCartService.handle(val))
        }
      },
      // Product Title
      title: {
        type: Sequelize.STRING,
        set: function(val) {
          this.setDataValue('title', app.services.ProxyCartService.title(val))
        }
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
          this.setDataValue('seo_title', app.services.ProxyCartService.title(val))
        }
      },
      // SEO description
      seo_description: {
        type: Sequelize.TEXT,
        set: function(val) {
          this.setDataValue('seo_description', app.services.ProxyCartService.description(val))
        }
      },
      // Type of the product e.g. 'Snow Board'
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        set: function(val) {
          this.setDataValue('type', app.services.ProxyCartService.title(val))
        }
      },
      // The tax code of the product, defaults to physical good.
      tax_code: {
        type: Sequelize.STRING,
        defaultValue: PRODUCT_DEFAULTS.TAX_CODE // Physical Good
      },
      // Pricing Average against competitors
      compare_at_price: {
        type: Sequelize.INTEGER,
        defaultValue: PRODUCT_DEFAULTS.PRICE
      },
      // Default price of the product in cents
      price: {
        type: Sequelize.INTEGER,
        defaultValue: PRODUCT_DEFAULTS.PRICE
      },
      // Pricing after
      calculated_price: {
        type: Sequelize.INTEGER,
        defaultValue: PRODUCT_DEFAULTS.CALCULATED_PRICE
      },
      // Default currency of the product
      currency: {
        type: Sequelize.STRING,
        defaultValue: PRODUCT_DEFAULTS.CURRENCY
      },
      // Discounts applied
      discounted_lines: helpers.JSONB('Product', app, Sequelize, 'discounted_lines', {
        defaultValue: PRODUCT_DEFAULTS.DISCOUNTED_LINES
      }),
      // Total value of discounts
      total_discounts: {
        type: Sequelize.INTEGER,
        defaultValue: PRODUCT_DEFAULTS.TOTAL_DISCOUNTS
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
      options: helpers.JSONB('Product', app, Sequelize, 'options', {
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

      // The Total variants count
      total_variants: {
        type: Sequelize.INTEGER,
        defaultValue: PRODUCT_DEFAULTS.TOTAL_VARIANTS
      },

      // The Average Shipping Cost
      average_shipping: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      // Payment types that can not be used to purchase this product
      exclude_payment_types: helpers.JSONB('Product', app, Sequelize, 'exclude_payment_types', {
        defaultValue: []
      }),
      // Google Specific Listings
      google: helpers.JSONB('Product', app, Sequelize, 'google', {
        defaultValue: {
          // // 'Google Shopping / Google Product Category'
          // g_product_category: null,
          // // 'Google Shopping / Gender'
          // g_gender: null,
          // // 'Google Shopping / Age Group'
          // g_age_group: null,
          // // 'Google Shopping / MPN'
          // g_mpn: null,
          // // 'Google Shopping / Adwords Grouping'
          // g_adwords_grouping: null,
          // // 'Google Shopping / Adwords Labels'
          // g_adwords_label: null,
          // // 'Google Shopping / Condition'
          // g_condition: null,
          // // 'Google Shopping / Custom Product'
          // g_custom_product: null,
          // // 'Google Shopping / Custom Label 0'
          // g_custom_label_0: null,
          // // 'Google Shopping / Custom Label 1'
          // g_custom_label_1: null,
          // // 'Google Shopping / Custom Label 2'
          // g_custom_label_2: null,
          // // 'Google Shopping / Custom Label 3'
          // g_custom_label_3: null,
          // // 'Google Shopping / Custom Label 4'
          // g_custom_label_4: null
        }
      }),
      // Amazon Specific listings
      amazon: helpers.JSONB('Product', app, Sequelize, 'amazon', {
        defaultValue: {}
      }),

      // Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
