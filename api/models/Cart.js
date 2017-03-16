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
          //     live_mode: app.config.proxyEngine.live_mode
          //   }
          // },
          hooks: {
            beforeCreate: (values, options, fn) => {
              if (values.ip) {
                values.create_ip = values.ip
              }
              // If not token was already created, create it
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
                gift_card: data.gift_card,
                requires_shipping: data.requires_shipping,
                // requires_tax: data.requires_tax, // TODO resolve which of these to keep
                taxable: data.requires_tax, // TODO resolve which of these to keep
                tax_code: data.tax_code,
                tax_lines: [{}],
                requires_subscription: data.requires_subscription,
                subscription_interval: data.subscription_interval,
                subscription_unit: data.subscription_unit,
                weight: data.weight,
                weight_unit: data.weight_unit,
                images: data.images.length > 0 ? data.images : data.Product.images,
                quantity: data.quantity,
                fulfillable_quantity: data.fulfillable_quantity,
                grams: app.services.ProxyCartService.resolveConversion(data.weight, data.weight_unit) * data.quantity,
                // TODO handle discounts
                total_discounts: 0,
                vendor: data.Product.vendor,
                live_mode: data.live_mode
              }
              return line
            },
            // TODO handle deny adding product if restricted by fulfillment policy
            addLine: function(item, qty, properties) {
              // The quantity available of this variant
              let lineQtyAvailabile = 0
              // Check if Product is Available
              return item.checkAvailability(qty)
                .then(availability => {
                  if (!availability.allowed) {
                    throw new Error(`${availability.title} is not available in this quantity, please try a lower quantity`)
                  }
                  lineQtyAvailabile = availability.quantity
                  // Check if Product is Restricted
                  return item.checkRestrictions(this.Customer || this.customer_id)
                })
                .then(restricted => {
                  if (restricted) {
                    throw new Error(`${restricted.title} can not be shipped to ${restricted.city} ${restricted.province} ${restricted.country}`)
                  }
                  // Rename line items so they are no longer immutable
                  const lineItems = this.line_items
                  if (!qty || !_.isNumber(qty)) {
                    qty = 1
                  }
                  const itemIndex = _.findIndex(lineItems, {variant_id: item.id})
                  if (itemIndex > -1) {
                    app.log.silly('Cart.addLine NEW QTY', lineItems[itemIndex])
                    const calculatedQty = lineItems[itemIndex].quantity + qty
                    lineItems[itemIndex].quantity = calculatedQty
                    lineItems[itemIndex].fulfillable_quantity = calculatedQty > lineQtyAvailabile ? Math.max(0,lineQtyAvailabile - calculatedQty) : calculatedQty
                    this.line_items = lineItems
                  }
                  else {
                    item.quantity = qty
                    item.fulfillable_quantity = qty > lineQtyAvailabile ? Math.max(0, lineQtyAvailabile - qty) : qty
                    item.properties = properties
                    const line = this.line(item)
                    app.log.silly('Cart.addLine NEW LINE', line)
                    lineItems.push(line)
                    this.line_items = lineItems
                  }
                  return this.save()
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
              const totalCoupons = 0
              let totalTax = 0
              let totalWeight = 0
              let totalPrice = 0
              let totalLineItemsPrice = 0
              let totalShipping = 0
              let taxLines = []
              let shippingLines = []
              // let discountedLines = []
              let requiresShipping = false

              _.each(this.line_items, item => {
                // if (item.tax_lines.length > 0) {
                //   taxLines.concat(item.tax_lines)
                // }
                if (item.requires_shipping) {
                  totalWeight = totalWeight + item.grams
                  requiresShipping = true
                }
                subtotalPrice = subtotalPrice + item.price * item.quantity
                totalLineItemsPrice = totalLineItemsPrice + item.price * item.quantity
                totalDiscounts = totalDiscounts + item.total_discounts
              })
              // Resolve taxes
              return app.services.TaxService.calculate(this)
                .then(tax => {
                  // Add tax lines
                  taxLines = tax
                  // Calculate tax costs
                  _.each(taxLines, line => {
                    totalTax = totalTax + line.price
                  })
                  // Resolve Shipping
                  return app.services.ShippingService.calculate(this)
                })
                .then(shipping => {
                  // Add shipping lines
                  shippingLines = shipping
                  // Calculate shipping costs
                  _.each(shippingLines, line => {
                    totalShipping = totalShipping + line.price
                  })

                  // Finalize Total
                  totalPrice = totalTax + totalShipping + subtotalPrice - totalDiscounts - totalCoupons

                  // Set Cart values
                  this.tax_lines = taxLines
                  this.shipping_lines = shippingLines
                  this.total_shipping = totalShipping
                  this.subtotal_price = subtotalPrice
                  this.total_discounts = totalDiscounts
                  this.total_tax = totalTax
                  this.total_weight = totalWeight
                  this.total_line_items_price = totalLineItemsPrice
                  this.total_price = totalPrice
                  this.requires_shipping = requiresShipping
                  // TODO
                  this.total_due = totalPrice

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
              // models.Cart.belongsTo(models.Customer, {
              //   // as: 'customer'
              //   // as: 'customer_id'
              // })
              models.Cart.belongsTo(models.Address, {
                as: 'shipping_address',
                through: {
                  model: models.CartAddress,
                  foreignKey: 'cart_id',
                  unique: true,
                  scope: {
                    address: 'shipping_address'
                  },
                  constraints: false
                }
              })
              models.Cart.belongsTo(models.Address, {
                as: 'billing_address',
                through: {
                  model: models.CartAddress,
                  foreignKey: 'cart_id',
                  unique: true,
                  scope: {
                    address: 'billing_address'
                  },
                  constraints: false
                }
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
        customer_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Customer',
            key: 'id'
          }
        },
        shop_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Shop',
            key: 'id'
          }
        },
        // Unique identifier for a particular cart.
        token: {
          type: Sequelize.STRING,
          unique: true
        },
        // The status of the cart defaults to 'open'
        status: {
          type: Sequelize.ENUM,
          values: _.values(CART_STATUS),
          defaultValue: CART_STATUS.OPEN
        },
        // The three letter code (ISO 4217) for the currency used for the payment.
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
        },
        // The items in the cart
        line_items: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'line_items', {
          defaultValue: []
        }),
        // Price of the checkout before shipping and taxes
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The line_items that have discounts
        discounted_lines: helpers.JSONB('cart', app, Sequelize, 'discounted_lines', {
          defaultValue: {}
        }),
        // The line_items that require shipping
        shipping_lines: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'shipping_lines', {
          defaultValue: []
        }),
        // If the cost of shipping is included
        shipping_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // An array of selected shipping_rates
        shipping_rate: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'shipping_rate', {
          defaultValue: []
        }),
        // An array of shipping_rate objects, each of which details the shipping methods available.
        shipping_rates: helpers.ARRAY('cart', app, Sequelize, Sequelize.JSON, 'shipping_rates', {
          defaultValue: []
        }),
        // If this cart contains an item that requires shipping
        requires_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // If shipping is taxed
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
        // The amount left to be paid. This is equal to the cost of the line items, taxes and shipping minus discounts and gift cards.
        total_due: {
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
        // The request details of the customer you are processing the checkout on behalf of.
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
        // The reservation time in seconds for the products in the line items. This can be set up to 5 minutes, or 1 hour depending on the authentication type used.
        reservation_time: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The time in seconds that the products in the line items will be held. If the reservation time expires, the products may not be available and completion may fail.
        reservation_time_left: {
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
