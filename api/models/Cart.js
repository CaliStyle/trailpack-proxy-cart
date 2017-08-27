/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
const CART_STATUS = require('../utils/enums').CART_STATUS
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD
const queryDefaults = require('../utils/queryDefaults')

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
              app.services.CartService.beforeCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            beforeUpdate: (values, options, fn) => {
              app.services.CartService.beforeUpdate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            beforeSave: (values, options, fn) => {
              app.services.CartService.beforeSave(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
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
              models.Cart.belongsTo(models.Customer, {
                // as: 'customer_id',
              })
              models.Cart.belongsTo(models.Shop, {
                // as: 'shop_id',
              })

              models.Cart.belongsToMany(models.User, {
                as: 'owners',
                through: {
                  model: models.UserItem,
                  scope: {
                    item: 'cart'
                  }
                },
                foreign_id: 'item_id',
                constraints: false
              })
              models.Cart.belongsTo(models.Address, {
                as: 'shipping_address',
              })
              models.Cart.belongsTo(models.Address, {
                as: 'billing_address',
              })
              models.Cart.belongsToMany(models.Address, {
                as: 'addresses',
                // otherKey: 'address_id',
                foreignKey: 'model_id',
                through: {
                  model: models.ItemAddress,
                  scope: {
                    model: 'cart'
                  },
                  constraints: false
                },
                constraints: false
              })
              models.Cart.belongsToMany(models.Discount, {
                as: 'discount_codes',
                through: {
                  model: models.ItemDiscount,
                  unique: false,
                  scope: {
                    model: 'cart'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
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
              // models.Cart.hasMany(models.Coupon, {
              //   as: 'coupons'
              //   // constraints: false
              // })
              // models.Cart.hasMany(models.GiftCard, {
              //   as: 'gift_cards'
              //   // constraints: false
              // })
            },
            /**
             *
             * @param criteria
             * @param options
             * @returns {*|Promise.<Instance>}
             */
            findByIdDefault: function(criteria, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Cart.default(app))
              return this.findById(criteria, options)
            },
            /**
             *
             * @param options
             * @returns {*|Promise.<Instance>}
             */
            findOneDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Cart.default(app))
              return this.findOne(options)
            },
            /**
             *
             * @param token
             * @param options
             * @returns {*|Promise.<Instance>}
             */
            findByTokenDefault: function(token, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Cart.default(app), {
                where: {
                  token: token
                }
              })
              return this.findOne(options)
            },
            resolve: function(cart, options){
              options = options || {}
              const Cart =  this
              if (cart instanceof Cart.Instance){
                return Promise.resolve(cart)
              }
              else if (cart && _.isObject(cart) && cart.id) {
                return Cart.findByIdDefault(cart.id, options)
                  .then(resCart => {
                    if (!resCart) {
                      throw new Errors.FoundError(Error(`Cart ${cart.id} not found`))
                    }
                    return resCart
                  })
              }
              else if (cart && _.isObject(cart) && cart.token) {
                return Cart.findByTokenDefault(cart.token, options)
                  .then(resCart => {
                    if (!resCart) {
                      throw new Errors.FoundError(Error(`Cart ${cart.token} not found`))
                    }
                    return resCart
                  })
              }
              else if (cart && _.isObject(cart)) {
                return this.create(cart, options)
              }
              else if (cart && (_.isNumber(cart))) {
                return Cart.findByIdDefault(cart, options)
                  .then(resCart => {
                    if (!resCart) {
                      throw new Errors.FoundError(Error(`Cart ${cart} not found`))
                    }
                    return resCart
                  })
              }
              else if (cart && (_.isString(cart))) {
                return Cart.findByTokenDefault(cart, options)
                  .then(resCart => {
                    if (!resCart) {
                      throw new Errors.FoundError(Error(`Cart ${cart} not found`))
                    }
                    return resCart
                  })
              }
              else {
                // TODO create proper error
                const err = new Error(`Unable to resolve Cart ${cart}`)
                return Promise.reject(err)
              }
            }
          },
          instanceMethods: {
            /**
             *
             * @param data
             */
            // TODO handle discounts, Select Vendor
            line: function(data){
              // handle empty product
              data.Product = data.Product || {}

              const line = {
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
                total_discounts: 0,
                requires_subscription: data.requires_subscription,
                subscription_interval: data.subscription_interval,
                subscription_unit: data.subscription_unit,
                weight: data.weight * data.quantity,
                weight_unit: data.weight_unit,
                images: data.images.length > 0 ? data.images : data.Product.images,
                quantity: data.quantity,
                fulfillable_quantity: data.fulfillable_quantity,
                max_quantity: data.max_quantity,
                grams: app.services.ProxyCartService.resolveConversion(data.weight, data.weight_unit) * data.quantity,
                vendors: data.Product.vendors,
                vendor_id: data.vendor_id || null,
                average_shipping: data.Product.average_shipping,
                exclude_payment_types: data.Product.exclude_payment_types,
                fulfillment_extras: data.fufillment_extras,
                live_mode: data.live_mode
              }
              return line
            },
            addLine: function(item, qty, properties, options) {
              options = options || {}
              // The quantity available of this variant
              let lineQtyAvailable = -1
              let line
              // Check if Product is Available
              return item.checkAvailability(qty, {transaction: options.transaction || null})
                .then(availability => {
                  if (!availability.allowed) {
                    throw new Error(`${availability.title} is not available in this quantity, please try a lower quantity`)
                  }
                  lineQtyAvailable = availability.quantity
                  // Check if Product is Restricted
                  return item.checkRestrictions(
                    this.Customer || this.customer_id,
                    {transaction: options.transaction || null}
                  )
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
                  // If already in cart
                  if (itemIndex > -1) {
                    app.log.silly('Cart.addLine NEW QTY', lineItems[itemIndex])
                    const maxQuantity = lineItems[itemIndex].max_quantity || -1
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
                  // If new item
                  else {
                    const maxQuantity = item.max_quantity || -1
                    let calculatedQty = qty

                    if (maxQuantity > -1 && calculatedQty > maxQuantity) {
                      calculatedQty = maxQuantity
                    }

                    if (lineQtyAvailable > -1 && calculatedQty > lineQtyAvailable) {
                      calculatedQty = Math.max(0, lineQtyAvailable - calculatedQty)
                    }
                    // Item Quantity in cart
                    item.quantity = calculatedQty
                    // The max that will be fulfilled
                    item.fulfillable_quantity = calculatedQty
                    // The max allowed to be purchased
                    item.max_quantity = maxQuantity
                    // The properties of the item
                    item.properties = properties
                    // Set line
                    line = this.line(item)
                    app.log.silly('Cart.addLine NEW LINE', line)
                    // Add line to line items
                    lineItems.push(line)
                    // Assign line items
                    this.line_items = lineItems
                  }
                  return this
                })
            },
            /**
             *
             * @param item
             * @param qty
             * @returns {Promise.<this>}
             */
            removeLine: function(item, qty, options) {
              options = options || {}
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
             * @param status
             * @param save
             */
            close: function(status, save) {
              this.status = status || CART_STATUS.CLOSED
              if (save) {
                return this.save(save)
              }
              return this //Promise.resolve(this)
            },
            /**
             *
             * @param status
             * @param save
             */
            draft: function (status, save) {
              this.status = status || CART_STATUS.DRAFT
              if (save) {
                return this.save(save)
              }
              return this //Promise.resolve(this)
            },
            clear: function () {
              this.line_items = []
              return this
            },
            /**
             *
             * @param order
             * @param save
             */
            order: function(order, save) {
              this.order_id = order.id
              this.status = CART_STATUS.ORDERED
              if (save) {
                return this.save(save)
              }
              // console.log('WANTS PROMISE', this)
              return this //Promise.resolve(this)
            },
            /**
             *
             * @param options
             */
            buildOrder: function(options) {
              options = options || {}
              const buildOrder = {
                // Request info
                client_details: options.client_details || this.client_details,
                ip: options.ip || null,
                payment_details: options.payment_details,
                payment_kind: options.payment_kind || app.config.proxyCart.orders.payment_kind,
                transaction_kind: options.transaction_kind || app.config.proxyCart.orders.transaction_kind,
                fulfillment_kind: options.fulfillment_kind || app.config.proxyCart.orders.fulfillment_kind,
                processing_method: options.processing_method || PAYMENT_PROCESSING_METHOD.CHECKOUT,
                shipping_address: options.shipping_address || this.shipping_address,
                billing_address: options.billing_address || this.billing_address,
                email: options.email || null,

                // Customer Info
                customer_id: options.customer_id || this.customer_id || null,

                // User ID
                user_id: options.user_id || this.user_id || null,

                // Cart Info
                cart_token: this.token,
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
                notes: this.notes,

                //Pricing Overrides
                pricing_override_id: this.pricing_override_id,
                pricing_overrides: this.pricing_overrides,
                total_overrides: this.total_overrides
              }
              return buildOrder
            },
            recalculate: function(options) {
              options = options || {}
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
              let totalOverrides = 0

              // Reset Globals
              this.has_shipping = false
              this.has_subscription = false

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
                // Check if at least one item requires subscription
                if (item.requires_subscription) {
                  this.has_subscription = true
                }
                totalItems = totalItems + item.quantity
                subtotalPrice = subtotalPrice + item.price * item.quantity
                totalLineItemsPrice = totalLineItemsPrice + item.price * item.quantity

                this.total_price = subtotalPrice
                this.total_due = subtotalPrice
              })

              // Get Cart Collections
              return app.services.CollectionService.cartCollections(this)
                .then(resCollections => {
                  collections = resCollections
                  // Resolve taxes
                  return app.services.TaxService.calculate(this, collections, app.orm['Cart'])
                })
                .then(tax => {
                  // Add tax lines
                  _.each(this.tax_lines, line => {
                    totalTax = totalTax + line.price
                  })
                  this.total_tax = totalTax
                  this.total_due = this.total_due + totalTax
                  // Resolve Shipping
                  return app.services.ShippingService.calculate(this, collections, app.orm['Cart'])
                })
                .then(shipping => {
                  // Add shipping lines
                  // shippingLines = shipping
                  // // Calculate shipping costs
                  _.each(this.shipping_lines, line => {
                    totalShipping = totalShipping + line.price
                  })
                  this.total_shipping = totalShipping
                  this.total_due = this.total_due + totalShipping
                  // Resolve Discounts
                  return app.services.DiscountService.calculate(this, collections, app.orm['Cart'])
                })
                .then(discounts => {
                  // console.log(discounts)
                  // discountedLines = discounts
                  _.each(this.discounted_lines, line => {
                    totalDiscounts = totalDiscounts + line.price
                  })
                  this.total_discounts = totalDiscounts
                  this.total_due = this.total_due - totalDiscounts
                  return app.services.CouponService.calculate(this, collections, app.orm['Cart'])
                })
                .then(coupons => {
                  _.each(this.coupon_lines, line => {
                    totalCoupons = totalCoupons + line.price
                  })
                  this.total_coupons = totalCoupons
                  this.total_due = this.total_due - totalCoupons
                  // Calculate Customer Balance
                  return app.services.CustomerService.calculateCart(this, {transaction: options.transaction || null})
                })
                .then(accountBalance => {
                  // console.log('BROKE',accountBalance)
                  _.each(this.pricing_overrides, line => {
                    totalOverrides = totalOverrides + line.price
                  })

                  // Finalize Totals
                  totalPrice = Math.max(0, totalTax + totalShipping + subtotalPrice)
                  totalDue = Math.max(0, totalPrice - totalDiscounts - totalCoupons - totalOverrides)

                  // Set Cart values
                  this.total_items = totalItems
                  this.total_shipping = totalShipping
                  this.subtotal_price = subtotalPrice
                  this.total_discounts = totalDiscounts
                  this.total_coupons = totalCoupons
                  this.total_tax = totalTax
                  this.total_weight = totalWeight
                  this.total_line_items_price = totalLineItemsPrice
                  this.total_overrides = totalOverrides
                  this.total_price = totalPrice
                  this.total_due = totalDue

                  return this
                })
            }
            // toJSON: function() {
            //   // Make JSON
            //   const resp = this.get({plain: true})
            //   // console.log('TOJSON CART', resp)
            //
            //   return resp
            // }
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
          // references: {
          //   model: 'Customer',
          //   key: 'id'
          // }
        },
        shop_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Shop',
          //   key: 'id'
          // }
        },
        order_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Shop',
          //   key: 'id'
          // }
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
        line_items: helpers.JSONB('Cart', app, Sequelize, 'line_items', {
          defaultValue: []
        }),
        // Price of the checkout before shipping and taxes
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The line_items that have discounts
        discounted_lines: helpers.JSONB('Cart', app, Sequelize, 'discounted_lines', {
          defaultValue: []
        }),
        // The line_items that have discounts
        coupon_lines: helpers.JSONB('Cart', app, Sequelize, 'coupon_lines', {
          defaultValue: []
        }),
        // The line_items that require shipping
        shipping_lines: helpers.JSONB('Cart', app, Sequelize, 'shipping_lines', {
          defaultValue: []
        }),
        // If the cost of shipping is included
        shipping_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // An array of selected shipping_rates
        shipping_rate: helpers.JSONB('Cart', app, Sequelize, 'shipping_rate', {
          defaultValue: []
        }),
        // An array of shipping_rate objects, each of which details the shipping methods available.
        shipping_rates: helpers.JSONB('Cart', app, Sequelize, 'shipping_rates', {
          defaultValue: []
        }),
        // If this cart contains an item that requires a subscription
        has_subscription: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // If this cart contains an item that requires shipping
        has_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // Total Items in Cart
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
        tax_lines: helpers.JSONB('Cart', app, Sequelize, 'tax_lines', {
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
        // The total monetary amount of discounts applied
        total_discounts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total monetary amount coupons applied
        total_coupons: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Array of pricing overrides objects
        pricing_overrides: helpers.JSONB('Cart', app, Sequelize, 'pricing_overrides', {
          defaultValue: []
        }),
        // The total monetary amount of pricing overrides
        total_overrides: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // USER id of the admin who did the override
        pricing_override_id: {
          type: Sequelize.INTEGER
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
        client_details: helpers.JSONB('Cart', app, Sequelize, 'client_details', {
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
        // Notes Supplied by customer
        notes: {
          type: Sequelize.TEXT
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
