/* eslint new-cap: [0] */
/* eslint no-console: [0] */
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
        enums: {
          DISCOUNT_TYPES: DISCOUNT_TYPES,
          DISCOUNT_STATUS: DISCOUNT_STATUS,
          DISCOUNT_SCOPE: DISCOUNT_SCOPE
        },
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
          },
          beforeUpdate: function(values, options) {
            if (values.body) {
              const bodyDoc = app.services.RenderGenericService.renderSync(values.body)
              values.body_html = bodyDoc.document
            }
          }
        },
        classMethods: {
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
                  model: 'productvariant'
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

            models.Discount.hasMany(models.DiscountEvent, {
              as: 'discount_events',
              foreignKey: 'discount_id'
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
            options = options || {}
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
                    return Promise.resolve()
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
            const Discount = this

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
          },
          /**
           *
           * @param discounts
           * @param options
           */
          transformDiscounts: (discounts, options) => {
            options = options || {}
            discounts = discounts || []

            const Discount = app.orm['Discount']
            const Sequelize = Discount.sequelize

            // Transform if necessary to objects
            discounts = discounts.map(discount => {
              if (discount && _.isNumber(discount)) {
                return { id: discount }
              }
              else if (discount && _.isString(discount)) {
                return {
                  handle: app.services.ProxyCartService.handle(discount),
                  name: discount
                }
              }
              else if (discount && _.isObject(discount) && (discount.name || discount.handle)) {
                discount.handle = app.services.ProxyCartService.handle(discount.handle) || app.services.ProxyCartService.handle(discount.name)
                return discount
              }
            })
            // Filter out undefined
            discounts = discounts.filter(discount => discount)

            return Sequelize.Promise.mapSeries(discounts, discount => {
              return Discount.findOne({
                where: _.pick(discount, ['id','handle']),
                attributes: ['id', 'handle', 'name'],
                transaction: options.transaction || null
              })
                .then(_discount => {
                  if (_discount) {
                    return _.extend(_discount, discount)
                  }
                  else {
                    return app.services.DiscountService.create(discount, {
                      transaction: options.transaction || null
                    })
                  }
                })
            })
          }
        },
        instanceMethods: {
          /**
           *
           * @returns {module:Discount}
           */
          start: function() {
            this.status = DISCOUNT_STATUS.ENABLED
            return this
          },
          /**
           *
           * @returns {module:Discount}
           */
          stop: function() {
            this.status = DISCOUNT_STATUS.DISABLED
            return this
          },
          /**
           *
           * @returns {module:Discount}
           */
          depleted: function () {
            this.status = DISCOUNT_STATUS.DEPLETED
            return this
          },
          /**
           *
           * @param orderId
           * @param customerId
           * @param price
           * @param options
           * @returns {Promise.<TResult>|*}
           */
          logUsage: function (orderId, customerId, price, options) {
            this.times_used++
            if (this.usage_limit > 0 && this.times_used >= this.usage_limit) {
              this.depleted()
            }
            return this.createDiscount_event({
              customer_id: customerId,
              order_id: orderId,
              price: price
            }, {
              transaction: options.transaction || null
            })
              .then(() => {
                return this.save({transaction: options.transaction || null})
              })
          },
          /**
           *
           * @param customerId
           * @param options
           * @returns {Promise.<T>}
           */
          eligibleCustomer: function(customerId, options) {
            return this.getDiscount_events({
              where: {
                customer_id: customerId
              },
              limit: 1,
              attributes: ['id','discount_id'],
              transaction: options.transaction || null
            })
              .then(_previousUsages => {
                _previousUsages = _previousUsages || []
                if (this.applies_once_per_customer && _previousUsages.length > 0) {
                  return this
                }
                else {
                  return true
                }
              })
              .catch(err => {
                app.log.error(err)
                return
              })
          },
          /**
           *
           * @param item
           * @param criteria
           * @returns {*}
           */
          discountItem: function(item, criteria) {
            criteria = criteria || []

            app.log.debug('Discount.discountItem CRITERIA', criteria)

            // Set item defaults
            item.discounted_lines = item.discounted_lines || []
            item.shipping_lines = item.shipping_lines || []
            item.calculated_price = item.calculated_price || item.price
            item.total_discounts = item.total_discounts || 0

            const discountedLine = {
              id: this.id,
              model: 'discount',
              type: null,
              name: this.name,
              scope: this.discount_scope,
              price: 0,
              applies: false,
              rules: {
                start: this.starts_at,
                end: this.ends_at,
                applies_once: this.applies_once,
                applies_once_per_customer: this.applies_once_per_customer,
                applies_compound: this.applies_compound,
                minimum_order_amount: this.minimum_order_amount
              }
            }

            let totalDeducted = 0

            // If this discount is not enabled
            if (this.status !== DISCOUNT_STATUS.ENABLED) {
              return item
            }
            // If this has a usage limit and is past it's usage limit
            if (this.usage_limit > 0 && this.times_used > this.usage_limit) {
              return item
            }

            // If this item type is excluded from discount, ignore
            if (
              this.discount_product_exclude.length > 0
              && this.discount_product_exclude.indexOf(item.type) > -1
            ) {
              return item
            }
            // If an item type is included in discount and it is not this item type, ignore
            if (
              this.discount_product_include.length > 0
              && this.discount_product_include.indexOf(item.type) === -1
            ) {
              return item
            }
            // If this discount has already been applied
            if (item.discounted_lines && item.discounted_lines.some(discount => discount.id === this.id)) {
              return item
            }

            // If this discount is individual
            // If this discount only applies to individual products
            if (this.discount_scope === DISCOUNT_SCOPE.INDIVIDUAL) {
              const criteriaPair = criteria.find(d => d.discount === this.id)
              if (!criteriaPair) {
                return item
              }
              else if (
                item.product_id
                && criteriaPair['product']
                && criteriaPair['product'].indexOf(item.product_id) === -1) {
                return item
              }
              else if (
                item.variant_id
                && criteriaPair['productvariant']
                && criteriaPair['productvariant'].indexOf(item.variant_id) === -1) {
                return item
              }
            }

            // Set the type
            // If this is rate
            if (this.discount_type === DISCOUNT_TYPES.RATE) {
              discountedLine.rate = this.discount_rate
              discountedLine.type = DISCOUNT_TYPES.RATE
              discountedLine.price = discountedLine.rate
            }
            // If this is a threshold
            else if (this.discount_type === DISCOUNT_TYPES.THRESHOLD) {
              discountedLine.threshold = this.discount_threshold
              discountedLine.type = DISCOUNT_TYPES.THRESHOLD
              discountedLine.price = discountedLine.threshold
            }
            // If this is a percentage
            else if (this.discount_type === DISCOUNT_TYPES.PERCENTAGE) {
              discountedLine.percentage = this.discount_percentage
              discountedLine.type = DISCOUNT_TYPES.PERCENTAGE
              discountedLine.price = Math.round((item.price * (discountedLine.percentage / 100)))
            }
            // If this a shipping discount, return because this needs a different calculation
            else if (this.discount_type === DISCOUNT_TYPES.SHIPPING) {
              return item
            }

            // Set the total deducted
            totalDeducted = Math.min(item.price, (item.price - (item.price - discountedLine.price)))

            // If the totalDeducted is greater then zero, add the discount line.
            if (totalDeducted > 0) {

              // If this is a threshold discount, subtract from the threshold for the rest of this iteration
              if (discountedLine.type === DISCOUNT_TYPES.THRESHOLD) {
                this.discount_threshold = Math.max(0, this.discount_threshold - totalDeducted)
              }

              discountedLine.price = totalDeducted
              item.discounted_lines.push(discountedLine)
            }

            return item

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
      // The value of the discount. See the discount_type property to learn more about how value is interpreted.
      discount_rate: {
        type: Sequelize.INTEGER
      },
      // The value of the discount. See the discount_type property to learn more about how value is interpreted.
      discount_threshold: {
        type: Sequelize.INTEGER
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

      // List of product types allowed to discount
      discount_product_include: helpers.JSONB('Discount', app, Sequelize, 'discount_product_include', {
        defaultValue: []
      }),
      // List of product_type [<string>] to forcefully excluded from discount modifiers
      discount_product_exclude: helpers.JSONB('Discount', app, Sequelize, 'discount_product_exclude', {
        defaultValue: []
      }),

      // List of customer types allowed to discount
      discount_customer_include: helpers.JSONB('Discount', app, Sequelize, 'discount_customer_include', {
        defaultValue: []
      }),
      // List of customer_type [<string>] to forcefully excluded from discount modifiers
      discount_customer_exclude: helpers.JSONB('Discount', app, Sequelize, 'discount_customer_exclude', {
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
      // Returns a count of successful checkouts where the discount code has been used. Cannot exceed the usage_limit property.
      times_used: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // When a discount applies to a product or collection resource, applies_once determines whether the discount should be applied once per order, or to every applicable item in the cart.
      applies_once: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      // Determines whether the discount should be applied once, or any number of times per customer.
      // Example, if true, then once the customer checks out, this discount can no longer apply to them
      // in subsequent orders.
      applies_once_per_customer: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // if this discount can be compounded with other discounts.
      applies_compound: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
