'use strict'

const Model = require('trails/model')
const DISCOUNT_TYPES = require('../utils/enums').DISCOUNT_TYPES
const DISCOUNT_STATUS = require('../utils/enums').DISCOUNT_STATUS
const _ = require('lodash')
/**
 * @module Discount
 * @description Discount Model
 */
module.exports = class Discount extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
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
                as: 'orders',
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
                    model: 'product_variant'
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

              const recursiveQuery = function(options) {
                let count = 0
                return self.findAndCountAll(options)
                  .then(results => {
                    count = results.count
                    return batch(results.rows)
                  })
                  .then(batched => {
                    if (count > options.offset + options.limit) {
                      options.offset = options.offset + options.limit
                      return recursiveQuery(options)
                    }
                    else {
                      return batched
                    }
                  })
              }
              return recursiveQuery(options)
            },
            resolve: function(discount, options){
              //
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
        // Specify how the discount's value will be applied to the order. Valid values are:
        //
        discount_type: {
          type: Sequelize.ENUM,
          values: _.values(DISCOUNT_TYPES),
          defaultValue: DISCOUNT_TYPES.FIXED_AMOUNT
        },
        // The case-insensitive discount code that customers use at checkout. Required when creating a discount. Maximum length of 255 characters.
        code: {
          type: Sequelize.STRING
        },
        // The value of the discount. Required when creating a percentage-based or fixed-amount discount. See the discount_type property to learn more about how value is interpreted.
        value: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
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
        minimum_order_amount: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The number of times this discount code can be redeemed. It can be redeemed by one or many customers; the usage_limit is a store-wide absolute value. Leave blank for unlimited uses.
        usage_limit: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The id of a collection or product that this discount code is restricted to. Leave blank for a store-wide discount. If applies_to_id is set, then the applies_to_resource property is also mandatory.
        applies_to_id: {
          type: Sequelize.STRING
        },
        // The discount code can be set to apply to only a product, variant, customer, or collection. If applies_to_resource is set, then applies_to_id should also be set.
        applies_to_resource: {
          type: Sequelize.STRING
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
        compound: {
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
    return schema
  }
}
