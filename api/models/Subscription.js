/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const helpers = require('proxy-engine-helpers')
const queryDefaults = require('../utils/queryDefaults')
const INTERVALS = require('../utils/enums').INTERVALS
const SUBSCRIPTION_CANCEL = require('../utils/enums').SUBSCRIPTION_CANCEL

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
              // The Order that Created this Subscription
              // models.Subscription.belongsTo(models.Order, {
              //   as: 'original_order_id'
              // })
              // // The Subscription Product
              // models.Subscription.belongsTo(models.Product, {
              //   // as: 'product_id'
              // })
              // The Subscription Product Variant
              // models.Subscription.belongsTo(models.ProductVariant, {
              //   // as: 'product_variant_id'
              // })
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
            },
            findByIdDefault: function(criteria, options) {
              options = _.merge(options, queryDefaults.Subscription.default(app))
              return this.findById(criteria, options)
            }
          },
          instanceMethods: {
            line: function(data){
              const line = {
                subscription_id: this.id,
                product_id: data.product_id,
                variant_id: data.id || data.variant_id,
                type: data.type,
                sku: data.sku,
                title: data.Product.title,
                variant_title: data.title,
                name: data.title == data.Product.title ? data.title : `${data.Product.title} - ${data.title}`,
                properties: data.properties,
                barcode: data.barcode,
                price: data.price,
                calculated_price: data.price,
                compare_at_price: data.compare_at_price,
                currency: data.currency,
                fulfillment_service: data.fulfillment_service,
                gift_card: data.gift_card,
                requires_shipping: data.requires_shipping,
                taxable: data.requires_tax,
                tax_code: data.tax_code,
                tax_lines: [],
                shipping_lines: [],
                discounted_lines: [],
                weight: data.weight,
                weight_unit: data.weight_unit,
                images: data.images.length > 0 ? data.images : data.Product.images,
                quantity: data.quantity,
                fulfillable_quantity: data.fulfillable_quantity,
                max_quantity: data.max_quantity,
                grams: app.services.ProxyCartService.resolveConversion(data.weight, data.weight_unit) * data.quantity,
                // TODO handle discounts
                total_discounts: 0,
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
            renew: function() {
              this.renewed_at = new Date()
              this.total_renewals++
            },
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
              const d = new Date(this.renewed_at)

              if (this.unit == INTERVALS.DAY) {
                d.setDate(d.getDay() + this.interval)
              }
              // else if (this.unit == INTERVALS.WEEK) {
              //   d.setMonth(d.getWeek() + this.interval);
              // }
              else if (this.unit == INTERVALS.MONTH) {
                d.setMonth(d.getMonth() + this.interval)
              }
              else if (this.unit == INTERVALS.BIMONTH) {
                d.setMonth(d.getMonth() + this.interval * 2)
              }
              else if (this.unit == INTERVALS.YEAR) {
                d.setYear(d.getYear() + this.interval)
              }
              else if (this.unit == INTERVALS.BIYEAR) {
                d.setYear(d.getYear() + this.interval * 2)
              }
              this.renews_on = new Date(d)


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
                  return app.services.TaxService.calculate(this, collections, app.services.SubscriptionService)
                })
                .then(tax => {
                  // Add tax lines
                  _.each(this.tax_lines, line => {
                    totalTax = totalTax + line.price
                  })
                  // Resolve Shipping
                  return app.services.ShippingService.calculate(this, collections, app.services.SubscriptionService)
                })
                .then(shipping => {
                  // Add shipping lines
                  // shippingLines = shipping
                  // // Calculate shipping costs
                  _.each(this.shipping_lines, line => {
                    totalShipping = totalShipping + line.price
                  })
                  return app.services.DiscountService.calculate(this, collections, app.services.SubscriptionService)
                })
                .then(discounts => {
                  // console.log(discounts)
                  // discountedLines = discounts
                  _.each(this.discounted_lines, line => {
                    totalDiscounts = totalDiscounts + line.price
                  })
                  return app.services.CouponService.calculate(this, collections, app.services.SubscriptionService)
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
          references: {
            model: 'Shop',
            key: 'id'
          }
        },
        // The Order that generated this subscription
        original_order_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Order',
            key: 'id'
          },
          allowNull: false
        },
        customer_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Customer',
            key: 'id'
          },
          allowNull: false
        },
        // Unique identifier for a particular cart.
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
        // The reason why the subscription was cancelled. If the subscription was not cancelled, this value is "null."
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
        line_items: helpers.ARRAY('subscription', app, Sequelize, Sequelize.JSON, 'line_items', {
          defaultValue: []
        }),
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The line_items that have discounts
        discounted_lines: helpers.ARRAY('subscription', app, Sequelize, Sequelize.JSON,  'discounted_lines', {
          defaultValue: []
        }),
        // The line_items that have discounts
        coupon_lines: helpers.ARRAY('subscription', app, Sequelize, Sequelize.JSON,  'coupon_lines', {
          defaultValue: []
        }),
        // The line_items that require shipping
        shipping_lines: helpers.ARRAY('subscription', app, Sequelize, Sequelize.JSON, 'shipping_lines', {
          defaultValue: []
        }),
        // If the cost of shipping is included
        shipping_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // An array of selected shipping_rates
        shipping_rate: helpers.ARRAY('subscription', app, Sequelize, Sequelize.JSON, 'shipping_rate', {
          defaultValue: []
        }),
        // An array of shipping_rate objects, each of which details the shipping methods available.
        shipping_rates: helpers.ARRAY('subscription', app, Sequelize, Sequelize.JSON, 'shipping_rates', {
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
        tax_lines: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'tax_lines', {
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
