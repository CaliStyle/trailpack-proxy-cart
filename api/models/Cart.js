/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
const CART_STATUS = require('../utils/enums').CART_STATUS
const shortid = require('shortid')
/**
 * @module Cart
 * @description Cart Model
 */
module.exports = class Cart extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          // defaultScope: {
          //   where: {
          //     live_mode: app.config.proxyCart.live_mode
          //   }
          // },
          hooks: {
            beforeCreate: (values, options, fn) => {
              if (values.ip) {
                values.create_ip = values.ip
              }
              if (!values.token) {
                values.token = `cart_${shortid.generate()}`
              }
              fn()
            },
            // TODO connect to Shop and Cart/Customer
            beforeUpdate: (values, options, fn) => {
              if (values.ip) {
                values.update_ip = values.ip
              }
              // if (values.line_items) {
              //   let subtotalPrice = 0
              //   let totalDiscounts = 0
              //   let totalCoupons = 0
              //   let totalTax = 0
              //   let totalWeight = 0
              //   let totalPrice = 0
              //   let totalLineItemsPrice = 0
              //   let totalShipping = 0
              //   const taxLines = []
              //   const shippingLines = []
              //   // const discountedLines = []
              //
              //   _.each(values.line_items, item => {
              //     // if (item.requires_tax) {
              //     //   // taxLines[item.variant_id] = item.price * item.quantity
              //     // }
              //     if (item.tax_lines.length > 0) {
              //       taxLines.concat(item.tax_lines)
              //     }
              //     if (item.requires_shipping) {
              //       // item.grams = app.services.ProxyCartService.resolveConversion(item.weight, item.weight_unit) * item.quantity
              //       // shippingLines[item.variant_id] = item.grams
              //       totalWeight = totalWeight + item.grams
              //     }
              //
              //     // if (item.name !== 'shipping' && item.name !== 'tax') {
              //     subtotalPrice = subtotalPrice + item.price * item.quantity
              //     totalLineItemsPrice = totalLineItemsPrice + item.price * item.quantity
              //     // }
              //     // if (item.name === 'shipping') {
              //     //   totalShipping = totalShipping + item.price
              //     // }
              //     // if (item.name === 'tax') {
              //     //   totalTax = totalTax + item.price
              //     // }
              //     // if (item.has_discount) {
              //       // discountedLines[item.variant_id] = item.discount
              //     totalDiscounts = totalDiscounts + item.total_discounts
              //     // }
              //   })
              //   _.each(taxLines, line => {
              //     totalTax = totalTax + line.price
              //   })
              //   _.each(shippingLines, line => {
              //     totalShipping = totalShipping + line.price
              //   })
              //   // if (values.taxes_included) {}
              //   //
              //   // if (values.shipping_included) {
              //   //   totalShipping = values.total_shipping
              //   // }
              //
              //   totalPrice = totalTax + totalShipping + subtotalPrice - totalDiscounts - totalCoupons
              //
              //   values.tax_lines = taxLines
              //   values.shipping_lines = shippingLines
              //   values.total_shipping = totalShipping
              //   values.subtotal_price = subtotalPrice
              //   values.total_discounts = totalDiscounts
              //   values.total_tax = totalTax
              //   values.total_weight = totalWeight
              //   values.total_line_items_price = totalLineItemsPrice
              //   values.total_price = totalPrice
              // }

              fn(null, values)
            }
          },
          instanceMethods: {
            line: function(data){
              const line = {
                product_id: data.product_id,
                variant_id: data.id || data.variant_id,
                sku: data.sku,
                title: data.Product.title,
                variant_title: data.title,
                name: data.title == data.Product.title ? data.title : `${data.Product.title} - ${data.title}`,
                properties: data.properties,
                barcode: data.barcode,
                price: data.price,
                compare_at_price: data.compare_at_price,
                currency: data.currency,
                fulfillment_service: data.fulfillment_service,
                requires_shipping: data.requires_shipping,
                requires_tax: data.requires_tax,
                taxable: data.requires_tax, // TODO resolve which of these to keep
                tax_lines: [{}],
                requires_subscription: data.requires_subscription,
                subscription_interval: data.subscription_interval,
                subscription_unit: data.subscription_unit,
                weight: data.weight,
                weight_unit: data.weight_unit,
                images: data.images.length > 0 ? data.images : data.Product.images,
                quantity: data.quantity,
                grams: app.services.ProxyCartService.resolveConversion(data.weight, data.weight_unit) * data.quantity,
                // TODO handle discounts
                total_discounts: 0,
                vendor: data.Product.vendor,
                live_mode: data.live_mode
              }
              return line
            },
            // TODO handle deny adding product if restricted by fulfillment policy
            addLine: function(item, qty) {
              const lineItems = this.line_items
              if (!qty || !_.isNumber(qty)) {
                qty = 1
              }
              let itemIndex = _.findIndex(lineItems, {variant_id: item.id})
              if (itemIndex > -1) {
                app.log.silly('Cart.addLine NEW QTY', lineItems[itemIndex])
                lineItems[itemIndex].quantity = lineItems[itemIndex].quantity + qty
                this.line_items = lineItems
              }
              else {
                item.quantity = qty
                const line = this.line(item)
                app.log.silly('Cart.addLine NEW LINE', line)
                lineItems.push(line)
                this.line_items = lineItems
              }
            },
            removeLine: function(item, qty) {
              const lineItems = this.line_items
              if (!qty || !_.isNumber(qty)) {
                qty = 1
              }
              let itemIndex = _.findIndex(lineItems, {variant_id: item.id})
              if (itemIndex > -1) {
                lineItems[itemIndex].quantity = lineItems[itemIndex].quantity - qty
                // Resolve Grams
                if ( lineItems[itemIndex].quantity < 1) {
                  app.log.silly(`Cart.removeLine removing '${lineItems[itemIndex].variant_id}' line completely`)
                  lineItems.splice(itemIndex, 1)
                }
                this.line_items = lineItems
              }
            },
            close: function(status) {
              this.status = status
            },
            recalculate: function() {
              let subtotalPrice = 0
              let totalDiscounts = 0
              let totalCoupons = 0
              let totalTax = 0
              let totalWeight = 0
              let totalPrice = 0
              let totalLineItemsPrice = 0
              let totalShipping = 0
              const taxLines = []
              const shippingLines = []

              // const discountedLines = []

              _.each(this.line_items, item => {
                // if (item.requires_tax) {
                //   // taxLines[item.variant_id] = item.price * item.quantity
                // }
                if (item.tax_lines.length > 0) {
                  taxLines.concat(item.tax_lines)
                }
                if (item.requires_shipping) {
                  // item.grams = app.services.ProxyCartService.resolveConversion(item.weight, item.weight_unit) * item.quantity
                  // shippingLines[item.variant_id] = item.grams
                  totalWeight = totalWeight + item.grams
                }

                // if (item.name !== 'shipping' && item.name !== 'tax') {
                subtotalPrice = subtotalPrice + item.price * item.quantity
                totalLineItemsPrice = totalLineItemsPrice + item.price * item.quantity
                // }
                // if (item.name === 'shipping') {
                //   totalShipping = totalShipping + item.price
                // }
                // if (item.name === 'tax') {
                //   totalTax = totalTax + item.price
                // }
                // if (item.has_discount) {
                // discountedLines[item.variant_id] = item.discount
                totalDiscounts = totalDiscounts + item.total_discounts
                // }
              })
              _.each(taxLines, line => {
                totalTax = totalTax + line.price
              })
              _.each(shippingLines, line => {
                totalShipping = totalShipping + line.price
              })
              // if (values.taxes_included) {}
              //
              // if (values.shipping_included) {
              //   totalShipping = values.total_shipping
              // }

              totalPrice = totalTax + totalShipping + subtotalPrice - totalDiscounts - totalCoupons

              this.tax_lines = taxLines
              this.shipping_lines = shippingLines
              this.total_shipping = totalShipping
              this.subtotal_price = subtotalPrice
              this.total_discounts = totalDiscounts
              this.total_tax = totalTax
              this.total_weight = totalWeight
              this.total_line_items_price = totalLineItemsPrice
              this.total_price = totalPrice

              return app.services.TaxService.calculate(this)
                .then(taxes => {
                  // TODO do something with taxes
                  return app.services.ShippingService.calculate(this)
                })
                .then(shipping => {
                  // TODO do something with shipping
                  return this
                })
            }
          },
          classMethods: {
            CART_STATUS: CART_STATUS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Cart.belongsTo(models.Shop, {
                // as: 'shop_id'
              })
              models.Cart.belongsTo(models.Customer, {
                // as: 'customer'
                // as: 'customer_id'
              })
              // models.Cart.belongsTo(models.Customer, {
              //   foreignKey: 'default_cart'
              //   // as: 'customer_id'
              // })
              // models.Cart.hasMany(models.Product, {
              //   as: 'products'
              //   // constraints: false
              // })
              // models.Cart.hasMany(models.ProductVariant, {
              //   as: 'variants'
              //   // constraints: false
              // })
              // models.Cart.hasMany(models.Discount, {
              //   as: 'discounts'
              //   // constraints: false
              // })
              // models.Cart.hasMany(models.Coupon, {
              //   as: 'coupons'
              //   // constraints: false
              // })
              // models.Cart.hasMany(models.GiftCard, {
              //   as: 'gift_cards'
              //   // constraints: false
              // })
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
        // Unique identifier for a particular cart.
        token: {
          type: Sequelize.STRING,
          // primaryKey: true
          unique: true
        },
        // The status of the cart defaults to 'open'
        status: {
          type: Sequelize.ENUM,
          values: _.values(CART_STATUS),
          defaultValue: CART_STATUS.OPEN
        },
        line_items: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'line_items', {
          defaultValue: []
        }),
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        discounted_lines: helpers.JSONB('cart', app, Sequelize, 'discounted_lines', {
          defaultValue: {}
        }),
        shipping_lines: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'shipping_lines', {
          defaultValue: []
        }),
        shipping_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        tax_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        tax_lines: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'tax_lines', {
          defaultValue: []
        }),
        tax_rate: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        tax_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        taxes_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        total_discounts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_line_items_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_shipping: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_tax: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_weight: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // IP addresses
        ip: {
          type: Sequelize.STRING
        },
        create_ip: {
          type: Sequelize.STRING
        },
        update_ip: {
          type: Sequelize.STRING
        },
        client_details: helpers.JSONB('cart', app, Sequelize, 'client_details', {
          defaultValue: {
            'accept_language': null,
            'browser_height': null,
            'browser_ip': '0.0.0.0',
            'browser_width': null,
            'session_hash': null,
            'user_agent': null
          }
        }),
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
