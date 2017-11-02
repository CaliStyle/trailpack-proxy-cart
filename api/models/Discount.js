/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
const DISCOUNT_TYPES = require('../../lib').Enums.DISCOUNT_TYPES
const DISCOUNT_STATUS = require('../../lib').Enums.DISCOUNT_STATUS
const DISCOUNT_SCOPE = require('../../lib').Enums.DISCOUNT_SCOPE
const _ = require('lodash')
/**
 * @module Discount
 * @description Discount Model
 */
module.exports = class Discount extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        // defaultScope: {
        //   where: {
        //     live_mode: app.config.proxyEngine.live_mode
        //   }
        // },
        scopes: {
          live: {
            where: {
              live_mode: true
            }
          },
          expired: () => {
            return {
              where: {
                ends_at: {
                  $gte: new Date()
                }
              }
            }
          },
          active: () => {
            return {
              where: {
                status: DISCOUNT_STATUS.ENABLED,
                starts_at: {
                  $gte: new Date()
                },
                ends_at: {
                  $lte: new Date()
                }
              }
            }
          }
        },
        hooks: {
          beforeValidate(values, options) {
            if (!values.handle && values.name) {
              values.handle = values.name
            }
          },
          beforeCreate: function(values, options) {
            if (values.body) {
              const bodyDoc = app.services.RenderGenericService.renderSync(values.body)
              values.body_html = bodyDoc.document
            }
          }
        },
        classMethods: {
          DISCOUNT_TYPES: DISCOUNT_TYPES,
          DISCOUNT_STATUS: DISCOUNT_STATUS,
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            // models.Cart.hasMany(models.Product, {
            //   as: 'products'
            // })
            models.Discount.belongsToMany(models.Order, {
              as: 'orders',
              through: {
                model: models.ItemDiscount,
                unique: false,
                scope: {
                  model: 'order'
                }
              },
              foreignKey: 'discount_id',
              constraints: false
            })
            models.Discount.belongsToMany(models.Cart, {
              as: 'carts',
              through: {
                model: models.ItemDiscount,
                unique: false,
                scope: {
                  model: 'cart'
                }
              },
              foreignKey: 'discount_id',
              constraints: false
            })
            models.Discount.belongsToMany(models.Product, {
              as: 'products',
              through: {
                model: models.ItemDiscount,
                unique: false,
                scope: {
                  model: 'product'
                }
              },
              foreignKey: 'discount_id',
              constraints: false
            })
            models.Discount.belongsToMany(models.ProductVariant, {
              as: 'variants',
              through: {
                model: models.ItemDiscount,
                unique: false,
                scope: {
                  model: 'variant'
                }
              },
              foreignKey: 'discount_id',
              constraints: false
            })
            models.Discount.belongsToMany(models.Customer, {
              as: 'customers',
              through: {
                model: models.ItemDiscount,
                unique: false,
                scope: {
                  model: 'customer'
                }
              },
              foreignKey: 'discount_id',
              constraints: false
            })
            models.Discount.belongsToMany(models.Collection, {
              as: 'collections',
              through: {
                model: models.ItemDiscount,
                unique: false,
                scope: {
                  model: 'collection'
                }
              },
              foreignKey: 'discount_id',
              constraints: false
            })
          },
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
            options.regressive = options.regressive || false

            const recursiveQuery = function(options) {
              let count = 0
              return self.findAndCountAll(options)
                .then(results => {
                  count = results.count
                  return batch(results.rows)
                })
                .then(batched => {
                  if (count >= (options.regressive ? options.limit : options.offset + options.limit)) {
                    options.offset = options.regressive ? 0 : options.offset + options.limit
                    return recursiveQuery(options)
                  }
                  else {
                    return batched
                  }
                })
            }
            return recursiveQuery(options)
          },
          /**
           *
           * @param discount
           * @param options
           * @returns {*}
           */
          resolve: function(discount, options){
            options = options || {}
            const Discount =  this

            if (discount instanceof Discount){
              return Promise.resolve(discount)
            }
            else if (discount && _.isObject(discount) && discount.id) {
              return Discount.findById(discount.id, options)
                .then(_discount => {
                  if (!_discount) {
                    throw new Errors.FoundError(Error(`Discount ${discount.id} not found`))
                  }
                  return _discount
                })
            }
            else if (discount && _.isObject(discount) && discount.handle) {
              return Discount.findOne(
                app.services.ProxyEngineService.mergeOptionDefaults(
                  options,
                  {
                    where: {
                      handle: discount.handle
                    }
                  }
                )
              )
                .then(_discount => {
                  if (!_discount) {
                    throw new Errors.FoundError(Error(`Discount ${discount.handle} not found`))
                  }
                  return _discount
                })
            }
            else if (discount && _.isObject(discount) && discount.code) {
              return Discount.findOne(
                app.services.ProxyEngineService.mergeOptionDefaults(
                  options,
                  {
                    where: {
                      code: discount.code
                    }
                  }
                )
               )
                .then(_discount => {
                  if (!_discount) {
                    throw new Errors.FoundError(Error(`Discount ${discount.code} not found`))
                  }
                  return _discount
                })
            }
            else if (discount && _.isNumber(discount)) {
              return Discount.findById(discount, options)
                .then(_discount => {
                  if (!_discount) {
                    throw new Errors.FoundError(Error(`Discount ${discount} not found`))
                  }
                  return _discount
                })
            }
            else if (discount && _.isString(discount)) {
              return Discount.findOne(
                app.services.ProxyEngineService.mergeOptionDefaults(
                  options,
                  {
                    where: {
                      code: discount
                    }
                  }
                )
              )
                .then(_discount => {
                  if (!_discount) {
                    throw new Errors.FoundError(Error(`Discount ${discount} not found`))
                  }
                  return _discount
                })
            }
            else {
              // TODO make Proper Error
              const err = new Error(`Not able to resolve discount ${discount}`)
              return Promise.reject(err)
            }
          }
        },
        instanceMethods: {
          start: function() {
            this.status = DISCOUNT_STATUS.ENABLED
            return this
          },
          stop: function() {
            this.status = DISCOUNT_STATUS.DISABLED
            return this
          },
          depleted: function () {
            this.status = DISCOUNT_STATUS.DEPLETED
            return this
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      handle: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        set: function(val) {
          this.setDataValue('handle', app.services.ProxyCartService.splitHandle(val) || null)
        }
      },
      // The name of the discount
      name: {
        type: Sequelize.STRING
      },
      // A description of the discount.
      description: {
        type: Sequelize.TEXT
      },
      // The body of a collection (in markdown or html)
      body: {
        type: Sequelize.TEXT
      },
      // The html of a collection (DO NOT EDIT DIRECTLY)
      body_html: {
        type: Sequelize.TEXT
      },
      // The case-insensitive discount code that customers use at checkout. Required when creating a discount. Maximum length of 255 characters.
      code: {
        type: Sequelize.STRING,
        notNull: true
      },
      // The scope of the discount price modifier for the collection (individual, global)
      discount_scope: {
        type: Sequelize.ENUM,
        values: _.values(DISCOUNT_SCOPE),
        defaultValue: DISCOUNT_SCOPE.INDIVIDUAL
      },
      // Specify how the discount's value will be applied to the order.
      // Valid values are: rate, percentage, shipping
      discount_type: {
        type: Sequelize.ENUM,
        values: _.values(DISCOUNT_TYPES),
        defaultValue: DISCOUNT_TYPES.RATE
      },
      // The value of the discount. Required when creating a percentage-based discount. See the discount_type property to learn more about how value is interpreted.
      discount_rate: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      // The value of the discount. Required when creating a rate-based discount. See the discount_type property to learn more about how value is interpreted.
      discount_percentage: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      // The value of the discount. Required when creating a shipping-based discount. See the discount_type property to learn more about how value is interpreted.
      discount_shipping: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },

      // TODO allow product includes
      // List of product types allowed to discount
      discount_product_include: helpers.JSONB('Discount', app, Sequelize, 'discount_product_include', {
        defaultValue: []
      }),
      // List of product_type [<string>] to forcefully excluded from discount modifiers
      discount_product_exclude: helpers.JSONB('Discount', app, Sequelize, 'discount_product_exclude', {
        defaultValue: []
      }),
      // List of product_type [<string>] to forcefully excluded from shipping modifiers
      shipping_product_exclude: helpers.JSONB('Discount', app, Sequelize, 'shipping_product_exclude', {
        defaultValue: []
      }),
      // List of product_type [<string>] to forcefully excluded from tax modifiers
      tax_product_exclude: helpers.JSONB('Discount', app, Sequelize, 'tax_product_exclude', {
        defaultValue: []
      }),

      // The date when the discount code becomes disabled
      ends_at: {
        type: Sequelize.DATE
      },
      // The date the discount becomes valid for use during checkout
      starts_at: {
        type: Sequelize.DATE
      },
      // The status of the discount code. Valid values are enabled, disabled, or depleted.
      status: {
        type: Sequelize.ENUM,
        values: _.values(DISCOUNT_STATUS),
        defaultValue: DISCOUNT_STATUS.ENABLED
      },
      // The minimum value an order must reach for the discount to be allowed during checkout.
      // Value of -1 or 0 is ignored
      minimum_order_amount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // The number of times this discount code can be redeemed. It can be redeemed by one or many customers; the usage_limit is a store-wide absolute value. Leave blank for unlimited uses.
      // Value of -1 or 0 equates to unlimited usage
      usage_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // When a discount applies to a product or collection resource, applies_once determines whether the discount should be applied once per order, or to every applicable item in the cart.
      applies_once: {
        type: Sequelize.BOOLEAN
      },
      // Determines whether the discount should be applied once, or any number of times per customer.
      applies_once_per_customer: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      // if this discount can be compounded with other discounts.
      applies_compound: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // Returns a count of successful checkouts where the discount code has been used. Cannot exceed the usage_limit property.
      times_used: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
