/* eslint no-console: [0] */
/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
const queryDefaults = require('../utils/queryDefaults')
const UNITS = require('../../lib').Enums.UNITS
const INTERVALS = require('../../lib').Enums.INTERVALS
const INVENTORY_POLICY = require('../../lib').Enums.INVENTORY_POLICY
const VARIANT_DEFAULTS = require('../../lib').Enums.VARIANT_DEFAULTS
const _ = require('lodash')

/**
 * @module ProductVariant
 * @description Product Variant Model
 */
module.exports = class ProductVariant extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        // paranoid: !app.config.proxyCart.allow.destroy_variant,
        // defaultScope: {
        //   where: {
        //     live_mode: app.config.proxyEngine.live_mode
        //   },
        //   // paranoid: false,
        //   order: [['position','ASC']]
        // },
        scopes: {
          live: {
            where: {
              live_mode: true
            }
          }
        },
        hooks: {
          beforeValidate(values, options) {
            if (!values.calculated_price && values.price) {
              values.calculated_price = values.price
            }
          },
          beforeCreate(values, options) {
            return app.services.ProductService.beforeVariantCreate(values, options)
              .catch(err => {
                return Promise.reject(err)
              })
          },
          beforeUpdate(values, options) {
            return app.services.ProductService.beforeVariantUpdate(values, options)
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
          /**
           * Expose INTERVALS enums
           */
          INTERVALS: INTERVALS,
          /**
           * Expose INVENTORY_POLICY enums
           */
          INVENTORY_POLICY: INVENTORY_POLICY,
          /**
           * Expose VARIANT_DEFAULTS
           */
          VARIANT_DEFAULTS: VARIANT_DEFAULTS,
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.ProductVariant.belongsTo(models.Product, {
              foreignKey: 'product_id'
              // as: 'product_id',
              // foreign_key: 'id',
              // notNull: true
              // onDelete: 'CASCADE'
            })
            models.ProductVariant.belongsToMany(models.ProductVariant, {
              as: 'associations',
              through: {
                model: models.ProductAssociation,
                unique: false
                // scope: {
                //   model: 'product'
                // }
              },
              foreignKey: 'variant_id',
              otherKey: 'associated_variant_id'
              // constraints: false
            })
            models.ProductVariant.belongsToMany(models.ProductVariant, {
              as: 'relations',
              through: {
                model: models.ProductAssociation,
                unique: false
                // scope: {
                //   model: 'product'
                // }
              },
              foreignKey: 'associated_variant_id',
              otherKey: 'variant_id'
              // constraints: false
            })
            // models.ProductVariant.belongsTo(models.Product, {
            //   // foreignKey: 'variant_id',
            //   // as: 'product_id',
            //   onDelete: 'CASCADE'
            //   // foreignKey: {
            //   //   allowNull: false
            //   // }
            // })
            // models.ProductVariant.belongsToMany(models.Image, {
            //   as: 'images',
            //   through: {
            //     model: models.ItemImage,
            //     unique: false,
            //     scope: {
            //       model: 'variant'
            //     }
            //   },
            //   foreignKey: 'model_id',
            //   constraints: false
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
            models.ProductVariant.hasOne(models.Metadata, {
              as: 'metadata',
              foreignKey: 'product_variant_id'
            })
            models.ProductVariant.belongsToMany(models.Discount, {
              as: 'discounts',
              through: {
                model: models.ItemDiscount,
                unique: false,
                scope: {
                  model: 'variant'
                }
              },
              foreignKey: 'model_id',
              constraints: false
            })

            models.ProductVariant.hasMany(models.OrderItem, {
              as: 'order_items',
              foreignKey: 'variant_id'
            })

            models.ProductVariant.belongsToMany(models.Event, {
              as: 'event_items',
              through: {
                model: models.EventItem,
                unique: false,
                scope: {
                  object: 'productvariant'
                }
              },
              foreignKey: 'object_id',
              constraints: false
            })
            // models.ProductVariant.belongsToMany(models.Collection, {
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
          },
          /**
           *
           * @param id
           * @param options
           * @returns {*|Promise.<Instance>}
           */
          findByIdDefault: function(id, options) {
            options = options || {}
            options = _.defaultsDeep(options, queryDefaults.ProductVariant.default(app))
            return this.findById(id, options)
          },
          resolve: function(variant, options){
            options = options || {}
            const Variant = this

            if (variant instanceof Variant){
              return Promise.resolve(variant)
            }
            else if (variant && _.isObject(variant) && variant.id) {
              return Variant.findById(variant.id, options)
                .then(resVariant => {
                  if (!resVariant) {
                    throw new Errors.FoundError(Error(`Variant ${variant.id} not found`))
                  }
                  return resVariant
                })
            }
            else if (variant && _.isObject(variant) && variant.sku) {
              return Variant.findOne(_.defaultsDeep({
                where: {
                  sku: variant.sku
                }
              }, options))
                .then(resVariant => {
                  if (!resVariant) {
                    throw new Errors.FoundError(Error(`Variant ${variant.sku} not found`))
                  }
                  return resVariant
                })
            }
            else if (variant && _.isNumber(variant)) {
              return Variant.findById(variant, options)
                .then(resVariant => {
                  if (!resVariant) {
                    throw new Errors.FoundError(Error(`Variant ${variant} not found`))
                  }
                  return resVariant
                })
            }
            else if (variant && _.isString(variant)) {
              return Variant.findOne(_.defaultsDeep({
                where: {
                  sku: variant
                }
              }, options))
                .then(resVariant => {
                  if (!resVariant) {
                    throw new Errors.FoundError(Error(`Variant ${variant} not found`))
                  }
                  return resVariant
                })
            }
            else {
              // TODO create proper error
              const err = new Error(`Unable to resolve Variant ${variant}`)
              return Promise.reject(err)
            }
          }
        },
        instanceMethods: {
          // TODO Resolve customer address and see if product is allowed to be sent there
          checkRestrictions: function(customer, shippingAddress){
            return Promise.resolve(false)
          },
          // TODO check fulfillment policies
          checkAvailability: function(qty){
            let allowed = true
            if (qty > this.inventory_quantity && this.inventory_policy == INVENTORY_POLICY.DENY) {
              allowed = false
              qty = Math.max(0, qty + ( this.inventory_quantity - qty))
            }
            if (this.inventory_policy == INVENTORY_POLICY.RESTRICT) {
              qty = Math.max(0, qty + ( this.inventory_quantity - qty))
            }
            const res = {
              title: this.title,
              allowed: allowed,
              quantity: qty
            }
            return Promise.resolve(res)
          },
          resolveImages: function(options) {
            options = options || {}
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
                  _metadata = _metadata || {product_variant_id: this.id}
                  this.metadata = _metadata
                  this.setDataValue('metadata', _metadata)
                  this.set('metadata', _metadata)
                  return this
                })
            }
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      product_id: {
        type: Sequelize.INTEGER,
        unique: 'productvariant_sku',
        // references: {
        //   model: 'Product',
        //   key: 'id'
        // }
      },
      // The SKU for this Variation
      sku: {
        type: Sequelize.STRING,
        unique: 'productvariant_sku',
        allowNull: false,
        set: function(val) {
          this.setDataValue('sku', app.services.ProxyCartService.sku(val))
        }
      },
      // Variant Title
      title: {
        type: Sequelize.STRING
      },
      // Variant Title
      type: {
        type: Sequelize.STRING
      },
      // The option that this Variant is
      option: helpers.JSONB('ProductVariant', app, Sequelize, 'option', {
        // name: string, value:string
        defaultValue: {}
      }),
      // The Barcode of the Variant
      barcode: {
        type: Sequelize.STRING
      },
      // Default price of the product in cents
      price: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // The calculated Price of the product
      calculated_price: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // Competitor price of the variant in cents
      compare_at_price: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // The discounts applied to the product
      discounted_lines: helpers.JSONB('ProductVariant', app, Sequelize, 'discounted_lines', {
        defaultValue: []
      }),
      // The total Discounts applied to the product
      total_discounts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // Default currency of the variant
      currency: {
        type: Sequelize.STRING,
        defaultValue: VARIANT_DEFAULTS.CURRENCY
      },
      // The fulfillment generic that handles this request
      fulfillment_service: {
        type: Sequelize.STRING,
        defaultValue: VARIANT_DEFAULTS.FULFILLMENT_SERVICE
      },
      // The order of the product variant in the list of product variants.
      position: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      // Is product published
      published: {
        type: Sequelize.BOOLEAN,
        defaultValue: VARIANT_DEFAULTS.PUBLISHED
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
        defaultValue: VARIANT_DEFAULTS.REQUIRES_SHIPPING
      },
      // If Product needs to be taxed
      requires_taxes: {
        type: Sequelize.BOOLEAN,
        defaultValue: VARIANT_DEFAULTS.REQUIRES_TAX
      },
      // If Variant requires a subscription
      requires_subscription: {
        type: Sequelize.BOOLEAN,
        defaultValue: VARIANT_DEFAULTS.REQUIRES_SUBSCRIPTION
      },
      // If Product has subscription, the interval of the subscription, defaults to 0 months
      subscription_interval: {
        type: Sequelize.INTEGER,
        defaultValue: VARIANT_DEFAULTS.SUBSCRIPTION_INTERVAL
      },
      // If product has subscription, the unit of the interval
      subscription_unit: {
        type: Sequelize.ENUM,
        values: _.values(INTERVALS),
        defaultValue: VARIANT_DEFAULTS.SUBSCRIPTION_UNIT
      },
      // Specifies whether or not Proxy Cart tracks the number of items in stock for this product variant.
      inventory_management: {
        type: Sequelize.BOOLEAN,
        defaultValue: VARIANT_DEFAULTS.INVENTORY_MANAGEMENT
      },
      // Specifies whether or not customers are allowed to place an order for a product variant when it's out of stock.
      inventory_policy: {
        type: Sequelize.ENUM,
        values: _.values(INVENTORY_POLICY),
        defaultValue: VARIANT_DEFAULTS.INVENTORY_POLICY
      },
      // Amount of variant in inventory
      inventory_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: VARIANT_DEFAULTS.INVENTORY_QUANTITY
      },
      // The average amount of days to come in stock if out of stock
      inventory_lead_time: {
        type: Sequelize.INTEGER,
        defaultValue: VARIANT_DEFAULTS.INVENTORY_LEAD_TIME
      },
      max_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: VARIANT_DEFAULTS.MAX_QUANTITY
      },
      // The tax code of the product, defaults to physical good.
      tax_code: {
        type: Sequelize.STRING,
        defaultValue: VARIANT_DEFAULTS.TAX_CODE // Physical Good
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
        defaultValue: VARIANT_DEFAULTS.WEIGHT_UNIT
      },
      // Google Specific Listings
      google: helpers.JSONB('ProductVariant', app, Sequelize, 'google', {
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
      amazon: helpers.JSONB('ProductVariant', app, Sequelize, 'amazon', {
        defaultValue: {}
      }),
      // If this product was created in Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
