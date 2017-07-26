/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const moment = require('moment')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
const queryDefaults = require('../utils/queryDefaults')
const INTERVALS = require('../utils/enums').INTERVALS
const SUBSCRIPTION_CANCEL = require('../utils/enums').SUBSCRIPTION_CANCEL
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD

/**
 * @module Subscription
 * @description Subscription Model
 */
module.exports = class Subscription extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          defaultScope: {
            where: {
              live_mode: app.config.proxyEngine.live_mode
            }
          },
          scopes: {
            active: {
              where: {
                active: true
              }
            },
            deactivated: {
              where: {
                active: false,
                cancelled: false
              }
            },
            cancelled: {
              where: {
                cancelled: true
              }
            }
          },
          hooks: {
            beforeCreate: (values, options, fn) => {
              app.services.SubscriptionService.beforeCreate(values)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            beforeUpdate: (values, options, fn) => {
              app.services.SubscriptionService.beforeUpdate(values)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            afterUpdate: (values, options, fn) => {
              app.services.SubscriptionService.afterCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            afterCreate: (values, options, fn) => {
              app.services.SubscriptionService.afterCreate(values, options)
                .then(values => {
                  return values.save()
                })
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            }
          },
          classMethods: {
            INTERVALS: INTERVALS,
            SUBSCRIPTION_CANCEL: SUBSCRIPTION_CANCEL,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // The customer this subscription belongs to
              models.Subscription.belongsTo(models.Customer, {
                // as: 'customer_id'
              })
              models.Subscription.belongsTo(models.Shop, {
                // as: 'customer_id'
              })
              // // The Shop that originated this order
              // models.Subscription.belongsTo(models.Shop, {
              //   // as: 'shop_id'
              // })
              // The Order that Created this Subscription
              models.Subscription.belongsTo(models.Order, {
                as: 'original_order'
              })
              // The collection of subscriptions for a given customer
              models.Subscription.belongsToMany(models.Collection, {
                as: 'collections',
                through: {
                  model: models.ItemCollection,
                  unique: false,
                  scope: {
                    model: 'subscription'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              models.Subscription.hasMany(models.Event, {
                as: 'events',
                foreignKey: 'object_id',
                scope: {
                  object: 'subscription'
                },
                constraints: false
              })
              models.Subscription.hasMany(models.OrderItem, {
                as: 'order_items',
                foreignKey: 'subscription_id'
              })
            },
            /**
             *
             * @param criteria
             * @param options
             * @returns {*|Promise.<Instance>}
             */
            findByIdDefault: function(criteria, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Subscription.default(app))
              return this.findById(criteria, options)
            },
            /**
             *
             * @param token
             * @param options
             * @returns {*|Promise.<Instance>}
             */
            findByTokenDefault: function(token, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Subscription.default(app), {
                where: {
                  token: token
                }
              })
              return this.findOne(options)
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
                // let batched = 0
                return self.findAndCountAll(options)
                  .then(results => {
                    count = results.count
                    // batched = results.rows.length
                    // console.log('BROKE', count, batched, options.offset + options.limit)
                    return batch(results.rows)
                  })
                  .then(() => {
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
             * @param subscription
             * @param options
             * @returns {*}
             */
            resolve: function(subscription, options){
              options = options || {}
              // console.log('TYPEOF subscription',typeof subscription)
              const Subscription =  this

              if (subscription instanceof Subscription.Instance){
                return Promise.resolve(subscription)
              }
              else if (subscription && _.isObject(subscription) && subscription.id) {
                return Subscription.findByIdDefault(subscription.id, options)
                  .then(resSubscription => {
                    if (!resSubscription) {
                      throw new Errors.FoundError(Error(`Subscription ${subscription.id} not found`))
                    }
                    return resSubscription
                  })
              }
              else if (subscription && _.isObject(subscription) && subscription.token) {
                return Subscription.findByTokenDefault(subscription.token, options)
                  .then(resSubscription => {
                    if (!resSubscription) {
                      throw new Errors.FoundError(Error(`Subscription ${subscription.token} not found`))
                    }
                    return resSubscription
                  })
              }
              else if (subscription && _.isNumber(subscription)) {
                return Subscription.findByIdDefault(subscription, options)
                  .then(resSubscription => {
                    if (!resSubscription) {
                      throw new Errors.FoundError(Error(`Subscription ${subscription} not found`))
                    }
                    return resSubscription
                  })
              }
              else if (subscription && _.isString(subscription)) {
                return Subscription.findByTokenDefault(subscription, options)
                  .then(resSubscription => {
                    if (!resSubscription) {
                      throw new Errors.FoundError(Error(`Subscription ${subscription} not found`))
                    }
                    return resSubscription
                  })
              }
              else {
                // TODO create proper error
                const err = new Error(`Unable to resolve Subscription ${subscription}`)
                return Promise.reject(err)
              }
            }

          },
          instanceMethods: {
            resolveCustomer: function(options) {
              options = options || {}
              if (this.Customer && this.Customer instanceof app.orm['Customer'].Instance) {
                return Promise.resolve(this)
              }
              // Some orders may not have a customer Id
              else if (!this.customer_id) {
                return Promise.resolve(this)
              }
              else {
                return this.getCustomer({transaction: options.transaction || null})
                  .then(customer => {
                    customer = customer || null
                    this.Customer = customer
                    this.setDataValue('Customer', customer)
                    this.set('Customer', customer)
                    return this
                  })
              }
            },
            /**
             *
             * @param preNotification
             * @param options
             */
            notifyCustomer: function(preNotification, options) {
              options = options || {}
              if (this.customer_id) {
                return this.resolveCustomer({transaction: options.transaction || null })
                  .then(() => {
                    if (this.Customer && this.Customer instanceof app.orm['Customer'].Instance) {
                      return this.Customer.notifyUsers(preNotification, {transaction: options.transaction || null})
                    }
                    else {
                      return
                    }
                  })
                  .then(() => {
                    return this
                  })
              }
              else {
                return Promise.resolve(this)
              }
            },
            line: function(data){
              data.Product = data.Product || {}
              const line = {
                subscription_id: this.id,
                product_id: data.product_id,
                product_handle: data.Product.handle,
                variant_id: data.id || data.variant_id,
                type: data.type,
                sku: data.sku,
                title: data.Product.title,
                variant_title: data.title,
                name: data.title == data.Product.title ? data.title : `${data.Product.title} - ${data.title}`,
                properties: data.properties,
                option: data.option,
                barcode: data.barcode,
                price: data.price * data.quantity,
                calculated_price: data.price * data.quantity,
                compare_at_price: data.compare_at_price,
                price_per_unit: data.price,
                currency: data.currency,
                fulfillment_service: data.fulfillment_service,
                gift_card: data.gift_card,
                requires_shipping: data.requires_shipping,
                taxable: data.requires_tax,
                tax_code: data.tax_code,
                tax_lines: [],
                shipping_lines: [],
                discounted_lines: [],
                weight: data.weight * data.quantity,
                weight_unit: data.weight_unit,
                images: data.images.length > 0 ? data.images : data.Product.images,
                quantity: data.quantity,
                fulfillable_quantity: data.fulfillable_quantity,
                max_quantity: data.max_quantity,
                grams: app.services.ProxyCartService.resolveConversion(data.weight, data.weight_unit) * data.quantity,
                // TODO handle discounts
                total_discounts: 0,
                average_shipping: data.Product.average_shipping,
                exclude_payment_types: data.Product.exclude_payment_types,
                vendor: data.Product.vendor ? data.Product.vendor.name || data.Product.vendor : data.Product.vendor,
                live_mode: data.live_mode
              }
              return line
            },
            addLine: function(item, qty, properties) {
              // The quantity available of this variant
              let lineQtyAvailable = -1
              // Check if Product is Available
              return item.checkAvailability(qty)
                .then(availability => {
                  if (!availability.allowed) {
                    throw new Error(`${availability.title} is not available in this quantity, please try a lower quantity`)
                  }
                  lineQtyAvailable = availability.quantity
                  // Check if Product is Restricted
                  return item.checkRestrictions(this.Customer || this.customer_id)
                })
                .then(restricted => {
                  if (restricted) {
                    throw new Error(`${restricted.title} can not be delivered to ${restricted.city} ${restricted.province} ${restricted.country}`)
                  }
                  // Rename line items so they are no longer immutable
                  const lineItems = this.line_items
                  // Make quantity an integer
                  if (!qty || !_.isNumber(qty)) {
                    qty = 1
                  }
                  const itemIndex = _.findIndex(lineItems, {variant_id: item.id})
                  if (itemIndex > -1) {
                    app.log.silly('Subscription.addLine NEW QTY', lineItems[itemIndex])
                    const maxQuantity = lineItems[itemIndex].max_quantity
                    let calculatedQty = lineItems[itemIndex].quantity + qty

                    if (maxQuantity > -1 && calculatedQty > maxQuantity) {
                      calculatedQty = maxQuantity
                    }

                    if (lineQtyAvailable > -1 && calculatedQty > lineQtyAvailable) {
                      calculatedQty = Math.max(0, lineQtyAvailable - calculatedQty)
                    }

                    lineItems[itemIndex].quantity = calculatedQty
                    lineItems[itemIndex].fulfillable_quantity = calculatedQty
                    this.line_items = lineItems
                  }
                  else {
                    const maxQuantity = item.max_quantity
                    let calculatedQty = qty

                    if (maxQuantity > -1 && calculatedQty > maxQuantity) {
                      calculatedQty = maxQuantity
                    }

                    if (lineQtyAvailable > -1 && calculatedQty > lineQtyAvailable) {
                      calculatedQty = Math.max(0, lineQtyAvailable - calculatedQty)
                    }

                    item.quantity = calculatedQty
                    item.fulfillable_quantity = calculatedQty
                    item.max_quantity = maxQuantity
                    item.properties = properties
                    const line = this.line(item)
                    app.log.silly('Cart.addLine NEW LINE', line)
                    lineItems.push(line)
                    this.line_items = lineItems
                  }
                  return this
                })
            },
            removeLine: function(item, qty) {
              const lineItems = this.line_items
              if (!qty || !_.isNumber(qty)) {
                qty = 1
              }
              const itemIndex = _.findIndex(lineItems, {variant_id: item.id})
              if (itemIndex > -1) {
                lineItems[itemIndex].quantity = lineItems[itemIndex].quantity - qty
                lineItems[itemIndex].fulfillable_quantity = Math.max(0, lineItems[itemIndex].fulfillable_quantity - qty)
                // Resolve Grams
                if ( lineItems[itemIndex].quantity < 1) {
                  app.log.silly(`Cart.removeLine removing '${lineItems[itemIndex].variant_id}' line completely`)
                  lineItems.splice(itemIndex, 1)
                }
                this.line_items = lineItems
                return Promise.resolve(this)
              }
            },
            /**
             *
             * @returns Instance
             */
            renew: function() {
              this.renewed_at = new Date(Date.now())
              this.renew_retry_at = null
              this.total_renewal_attempts = 0
              this.total_renewals++
              return this
            },
            /**
             *
             * @returns Instance
             */
            retry: function() {
              this.renew_retry_at = new Date(Date.now())
              this.total_renewal_attempts++
              return this
            },
            /**
             *
             * @param data
             */
            buildOrder: function(data) {
              data = data || {}
              return {
                // Request info
                client_details: data.client_details || this.client_details,
                ip: data.ip || null,
                payment_details: data.payment_details,
                payment_kind: data.payment_kind || app.config.proxyCart.orders.payment_kind,
                transaction_kind: data.transaction_kind || app.config.proxyCart.orders.transaction_kind,
                fulfillment_kind: data.fulfillment_kind || app.config.proxyCart.orders.fulfillment_kind,
                processing_method: data.processing_method || PAYMENT_PROCESSING_METHOD.SUBSCRIPTION,
                shipping_address: data.shipping_address || this.shipping_address,
                billing_address: data.billing_address || this.billing_address,

                // Customer Info
                customer_id: data.customer_id || this.customer_id || null,
                email: data.email || null,

                // User ID
                user_id: data.user_id || this.user_id || null,

                // Subscription Info
                subscription_token: this.token,
                currency: this.currency,
                line_items: this.line_items,
                tax_lines: this.tax_lines,
                shipping_lines: this.shipping_lines,
                discounted_lines: this.discounted_lines,
                coupon_lines: this.coupon_lines,
                subtotal_price: this.subtotal_price,
                taxes_included: this.taxes_included,
                total_discounts: this.total_discounts,
                total_coupons: this.total_coupons,
                total_line_items_price: this.total_line_items_price,
                total_price: this.total_due,
                total_due: this.total_due,
                total_tax: this.total_tax,
                total_weight: this.total_weight,
                total_items: this.total_items,
                shop_id: this.shop_id,
                has_shipping: this.has_shipping,
                has_subscription: this.has_subscription,

                //Pricing Overrides
                pricing_override_id: this.pricing_override_id,
                pricing_overrides: this.pricing_overrides || [],
                total_overrides: this.total_overrides
              }
            },
            /**
             *
             * @returns {Promise.<T>}
             */
            recalculate: function() {
              // Default Values
              let collections = []
              let subtotalPrice = 0
              let totalDiscounts = 0
              let totalCoupons = 0
              let totalTax = 0
              let totalWeight = 0
              let totalPrice = 0
              let totalDue = 0
              let totalLineItemsPrice = 0
              let totalShipping = 0
              let totalItems = 0

              // Set Renewal Date
              const d = moment(this.renewed_at)
              // console.log('CHECK DATE', d, this.renewed_at, this.renews_on)
              if (this.unit == INTERVALS.DAY) {
                // d.setDate(d.getDay() + this.interval)
                d.add(this.interval, 'D')
              }
              else if (this.unit == INTERVALS.WEEK) {
                // d.setMonth(d.getWeek() + this.interval);
                d.add(this.interval, 'W')
              }
              else if (this.unit == INTERVALS.MONTH) {
                // d.setMonth(d.getMonth() + this.interval)
                d.add(this.interval, 'M')
                // console.log(d)
              }
              else if (this.unit == INTERVALS.BIMONTH) {
                d.add(this.interval * 2, 'M')
                // d.setMonth(d.getMonth() + this.interval * 2)
              }
              else if (this.unit == INTERVALS.YEAR) {
                d.add(this.interval, 'Y')
                // d.setYear(d.getYear() + this.interval)
              }
              else if (this.unit == INTERVALS.BIYEAR) {
                d.add(this.interval * 2, 'Y')
                // d.setYear(d.getYear() + this.interval * 2)
              }
              this.renews_on = d.format('YYYY-MM-DD HH:mm:ss')

              // console.log('CHECK DATE', this.renews_on, this.interval, this.unit)

              // Reset Globals
              this.has_shipping = false

              // Set back to default
              this.discounted_lines = []
              this.shipping_lines = []
              this.tax_lines = []

              const lineItems = this.line_items.map(item => {
                item.shipping_lines = []
                item.discounted_lines = []
                item.tax_lines = []
                item.total_discounts = 0
                item.calculated_price = item.price
                return item
              })
              this.line_items = lineItems

              // Calculate Totals
              this.line_items.forEach(item => {
                // Check if at least one time requires shipping
                if (item.requires_shipping) {
                  totalWeight = totalWeight + item.grams
                  this.has_shipping = true
                }

                totalItems = totalItems + item.quantity
                subtotalPrice = subtotalPrice + item.price * item.quantity
                totalLineItemsPrice = totalLineItemsPrice + item.price * item.quantity
              })

              // Get Cart Collections
              return app.services.CollectionService.subscriptionCollections(this)
                .then(resCollections => {
                  collections = resCollections
                  // Resolve taxes
                  return app.services.TaxService.calculate(this, collections, app.orm['Subscription'])
                })
                .then(tax => {
                  // Add tax lines
                  _.each(this.tax_lines, line => {
                    totalTax = totalTax + line.price
                  })
                  // Resolve Shipping
                  return app.services.ShippingService.calculate(this, collections, app.orm['Subscription'])
                })
                .then(shipping => {
                  // Add shipping lines
                  // shippingLines = shipping
                  // // Calculate shipping costs
                  _.each(this.shipping_lines, line => {
                    totalShipping = totalShipping + line.price
                  })
                  return app.services.DiscountService.calculate(this, collections, app.orm['Subscription'])
                })
                .then(discounts => {
                  // console.log(discounts)
                  // discountedLines = discounts
                  _.each(this.discounted_lines, line => {
                    totalDiscounts = totalDiscounts + line.price
                  })
                  return app.services.CouponService.calculate(this, collections, app.orm['Subscription'])
                })
                .then(coupons => {
                  _.each(this.coupon_lines, line => {
                    totalCoupons = totalCoupons + line.price
                  })

                  // Finalize Totals
                  totalPrice = Math.max(0, totalTax + totalShipping + subtotalPrice)
                  totalDue = Math.max(0, totalPrice - totalDiscounts - totalCoupons)

                  // Set Cart values
                  this.total_items = totalItems
                  this.total_shipping = totalShipping
                  this.subtotal_price = subtotalPrice
                  this.total_discounts = totalDiscounts
                  this.total_tax = totalTax
                  this.total_weight = totalWeight
                  this.total_line_items_price = totalLineItemsPrice
                  this.total_price = totalPrice
                  this.total_due = totalDue
                  // console.log('SUBSCRIPTION CALCULATION', this)
                  return this
                })
                .catch(err => {
                  return this
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
        shop_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Shop',
          //   key: 'id'
          // }
        },
        // The Order that generated this subscription
        original_order_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Order',
          //   key: 'id'
          // },
          // Have to allow null so that these can be created without an order
          // allowNull: true
        },
        customer_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Customer',
          //   key: 'id'
          // },
          allowNull: false
        },
        email: {
          type: Sequelize.STRING
        },
        // Unique identifier for a particular subscription.
        token: {
          type: Sequelize.STRING,
          unique: true
        },
        // The interval of the subscription, defaults to 0 months
        interval: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The unit of the interval
        unit: {
          type: Sequelize.ENUM,
          values: _.values(INTERVALS),
          defaultValue: INTERVALS.MONTH
        },
        // Active Subscription
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // The date time that the subscription was last renewed at
        renewed_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        // The next date time subscription will renew on
        renews_on: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        total_renewals: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        renew_retry_at: {
          type: Sequelize.DATE
        },
        total_renewal_attempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The reason why the subscription was cancelled. If the subscription was not cancelled, this value is "null."
        // cancelled Subscription
        cancelled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        cancel_reason: {
          type: Sequelize.ENUM,
          values: _.values(SUBSCRIPTION_CANCEL)
        },
        cancelled_at: {
          type: Sequelize.DATE
        },
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
        },
        line_items: helpers.JSONB('Subscription', app, Sequelize, 'line_items', {
          defaultValue: []
        }),
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The line_items that have discounts
        discounted_lines: helpers.JSONB('Subscription', app, Sequelize, 'discounted_lines', {
          defaultValue: []
        }),
        // The line_items that have discounts
        coupon_lines: helpers.JSONB('Subscription', app, Sequelize, 'coupon_lines', {
          defaultValue: []
        }),
        // The line_items that require shipping
        shipping_lines: helpers.JSONB('Subscription', app, Sequelize, 'shipping_lines', {
          defaultValue: []
        }),
        // If the cost of shipping is included
        shipping_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // An array of selected shipping_rates
        shipping_rate: helpers.JSONB('Subscription', app, Sequelize, 'shipping_rate', {
          defaultValue: []
        }),
        // An array of shipping_rate objects, each of which details the shipping methods available.
        shipping_rates: helpers.JSONB('Subscription', app, Sequelize, 'shipping_rates', {
          defaultValue: []
        }),
        // If this cart contains an item that requires shipping
        has_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        total_items: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // If shipping should be taxed
        tax_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // The line_items that have taxes
        tax_lines: helpers.JSONB('Subscription', app, Sequelize, 'tax_lines', {
          defaultValue: []
        }),
        // The rate at which taxes are applied
        tax_rate: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        // The rate as a percentage at which taxes are applies
        tax_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        // True when taxes are included in the subtotal_price
        taxes_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // The total amount of discounts applied
        total_discounts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of coupons applies
        total_coupons: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total original price of the line items
        total_line_items_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the prices of all the items in the checkout, taxes and discounts included.
        total_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The amount left to be paid. This is equal to the cost of the line items, taxes and shipping minus discounts and gift cards.
        total_due: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the Shipping costs
        total_shipping: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the taxes applied to the line items in the checkout.
        total_tax: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total weight of the cart
        total_weight: {
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
