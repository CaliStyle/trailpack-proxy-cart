/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
const shortid = require('shortid')
const ORDER_CANCEL = require('../utils/enums').ORDER_CANCEL
const ORDER_FINANCIAL = require('../utils/enums').ORDER_FINANCIAL
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const TRANSACTION_KIND = require('../utils/enums').TRANSACTION_KIND
const ORDER_FULFILLMENT = require('../utils/enums').ORDER_FULFILLMENT
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD


/**
 * @module Order
 * @description Order Model
 */
module.exports = class Order extends Model {

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
          hooks: {
            beforeCreate: (values, options, fn) => {
              if (values.ip) {
                values.create_ip = values.ip
              }
              if (!values.token) {
                values.token = `order_${shortid.generate()}`
              }
              fn()
            },
            // TODO connect to Shop
            beforeUpdate: (values, options, fn) => {
              if (values.ip) {
                values.update_ip = values.ip
              }
              fn()
            },
            // TODO, send receipt, other webhooks stuff
            afterCreate: (values, options, fn) => {
              values.number = `${values.shop_id}-${values.id}`
              if (!values.name && values.number) {
                values.name = `#${values.number}`
              }
              values.save(options)
                .then(values => {
                  fn()
                })
                .catch(err => {
                  fn(err)
                })
            }
          },
          classMethods: {
            ORDER_CANCEL: ORDER_CANCEL,
            ORDER_FINANCIAL: ORDER_FINANCIAL,
            ORDER_FULFILLMENT: ORDER_FULFILLMENT,
            PAYMENT_PROCESSING_METHOD: PAYMENT_PROCESSING_METHOD,
            TRANSACTION_STATUS: TRANSACTION_STATUS,
            TRANSACTION_KIND: TRANSACTION_KIND,
            FULFILLMENT_STATUS: FULFILLMENT_STATUS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // models.Order.belongsTo(models.Cart, {
              //   as: 'cart_token'
              // })
              // models.Order.belongsTo(models.Customer, {
              //   // as: 'customer_id'
              // })
              // models.Order.hasOne(models.CustomerAddress, {
              //   as: 'billing_address'
              // })
              // models.Order.hasOne(models.CustomerAddress, {
              //   as: 'shipping_address'
              // })
              // models.Order.belongsTo(models.Customer, {
              //   foreignKey: 'last_order_id'
              // })
              models.Order.belongsTo(models.Shop, {
                // as: 'shop_id'
              })
              models.Order.hasMany(models.OrderItem, {
                as: 'order_items'
              })
              // Applicable discount codes that can be applied to the order. If no codes exist the value will default to blank.
              models.Order.hasMany(models.Discount, {
                as: 'discount_codes'
              })
              models.Order.hasMany(models.Fulfillment, {
                as: 'fulfillments'
              })
              models.Order.hasMany(models.Transaction, {
                as: 'transactions'
              })
              // The list of refunds applied to the order.
              models.Order.hasMany(models.Refund, {
                as: 'refunds'
              })
              models.Order.belongsToMany(models.Tag, {
                as: 'tags',
                through: {
                  model: models.ItemTag,
                  unique: false,
                  scope: {
                    model: 'order'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
            },
            findIdDefault: function(criteria, options) {
              options = _.merge(options, {
                include: [
                  {
                    model: app.orm['OrderItem'],
                    as: 'order_items'
                  },
                  {
                    model: app.orm['Transaction'],
                    as: 'transactions'
                  },
                  {
                    model: app.orm['Fulfillment'],
                    as: 'fulfillments'
                  }
                ]
              })
              return this.findById(criteria, options)
            }
          },
          instanceMethods: {
            resolveFinancialStatus: function() {
              const Transaction = app.orm['Transaction']
              return Transaction.findAll({
                where: {
                  order_id: this.id
                }
              })
                .then(transactions => {
                  this.setFinancialStatus(transactions)
                  return this.save()
                })
            },
            resolveFulfillmentStatus: function() {
              const Fulfillment = app.orm['Fulfillment']
              return Fulfillment.findAll({
                where: {
                  order_id: this.id
                }
              })
                .then(fulfillments => {
                  this.setFulfillmentStatus(fulfillments)
                  return this.save()
                })
            },
            setFinancialStatus: function(transactions){

              let financialStatus = ORDER_FINANCIAL.PENDING
              // TRANSACTION STATUS pending, failure, success or error
              // TRANSACTION KIND authorize, capture, sale, refund, void

              let totalAuthorized = 0
              let totalVoided  = 0
              let totalSale = 0
              let totalRefund = 0

              // Calculate the totals of the transactions
              _.each(transactions, transaction => {
                if (transaction.kind == TRANSACTION_KIND.AUTHORIZE && transaction.status == TRANSACTION_STATUS.SUCCESS) {
                  totalAuthorized = totalAuthorized + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.VOID && transaction.status == TRANSACTION_STATUS.SUCCESS) {
                  totalVoided = totalVoided + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.CAPTURE && transaction.status == TRANSACTION_STATUS.SUCCESS) {
                  totalSale = totalSale + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.SALE && transaction.status == TRANSACTION_STATUS.SUCCESS) {
                  totalSale = totalSale + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.REFUND && transaction.status == TRANSACTION_STATUS.SUCCESS) {
                  totalRefund = totalRefund + transaction.amount
                }
              })
              // Total Authorized is the Price of the Order and there are no Capture/Sale transactions and 0 voided
              if (totalAuthorized == this.total_price && totalSale == 0 && totalVoided == 0) {
                // console.log('SHOULD BE: authorized')
                financialStatus = ORDER_FINANCIAL.AUTHORIZED
              }
              // Total Authorized is the Price of the Order and there are no Capture/Sale transactions
              else if (totalAuthorized == totalVoided && totalVoided > 0) {
                // console.log('SHOULD BE: voided')
                financialStatus = ORDER_FINANCIAL.VOIDED
              }
              // Total Sale is the Price of the order and there are no refunds
              else if (totalSale == this.total_price && totalRefund == 0) {
                // console.log('SHOULD BE: paid')
                financialStatus = ORDER_FINANCIAL.PAID
              }
              // Total Sale is not yet the Price of the order and there are no refunds
              else if (totalSale < this.total_price && totalSale > 0 && totalRefund == 0) {
                // console.log('SHOULD BE: partially_paid')
                financialStatus = ORDER_FINANCIAL.PARTIALLY_PAID
              }
              // Total Sale is the Total Price and Total Refund is Total Price
              else if (totalSale == this.total_price && totalRefund == this.total_price) {
                // console.log('SHOULD BE: refunded')
                financialStatus = ORDER_FINANCIAL.REFUNDED
              }
              // Total Sale is the Total Price but Total Refund is less than the Total Price
              else if (totalSale == this.total_price && totalRefund < this.total_price) {
                // console.log('SHOULD BE: partially_refunded')
                financialStatus = ORDER_FINANCIAL.PARTIALLY_REFUNDED
              }
              app.log.debug(`FINANCIAL Status: ${financialStatus}, Sales: ${totalSale}, Authorized: ${totalAuthorized}, Refunded: ${totalRefund}`)
              // pending: The finances are pending. (This is the default value.)
              // authorized: The finances have been authorized.
              // partially_paid: The finances have been partially paid.
              // paid: The finances have been paid.
              // partially_refunded: The finances have been partially refunded.
              // refunded: The finances have been refunded.
              // voided: The finances have been voided.
              this.financial_status = financialStatus
              return this
            },
            setFulfillmentStatus: function(fulfillments){
              let fulfillmentStatus = ORDER_FULFILLMENT.NONE
              let totalFulfillments = 0
              let totalPartialFulfillments = 0
              let totalNonFulfillments = 0
              _.each(fulfillments, fulfilment => {
                if (fulfilment.status == FULFILLMENT_STATUS.FULFILLED) {
                  totalFulfillments++
                }
                else if (fulfilment.status == FULFILLMENT_STATUS.PARTIAL) {
                  totalPartialFulfillments++
                }
                else if (fulfilment.status == FULFILLMENT_STATUS.NONE) {
                  totalNonFulfillments++
                }
              })
              if (totalFulfillments == fulfillments.length) {
                fulfillmentStatus = ORDER_FULFILLMENT.FULFILLED
              }
              else if (totalPartialFulfillments > 0) {
                fulfillmentStatus = ORDER_FULFILLMENT.PARTIAL
              }
              this.fulfillment_status = fulfillmentStatus
              return this
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
        // Unique identifier for a particular cart that is attached to a particular order.
        cart_token: {
          type: Sequelize.STRING,
          references: {
            model: 'Cart',
            key: 'token'
          }
        },
        customer_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Customer',
            key: 'id'
          }
        },
        // Billing Address on Order
        billing_address: helpers.JSONB('order', app, Sequelize, 'billing_address', {
          defaultValue: {}
        }),
        // Shipping Address on Order
        shipping_address: helpers.JSONB('order', app, Sequelize, 'shipping_address', {
          defaultValue: {}
        }),
        // If Buyer Accepts marketing
        buyer_accepts_marketing: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // The reason why the order was cancelled. If the order was not cancelled, this value is "null."
        cancel_reason: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_CANCEL)
        },
        // The time the order was cancelled
        cancelled_at: {
          type: Sequelize.DATE
        },
        // The details from the browser that placed the order
        client_details: helpers.JSONB('order', app, Sequelize, 'client_details', {
          defaultValue: {
            'host': null,
            'accept_language': null,
            'browser_height': null,
            'browser_ip': '0.0.0.0',
            'browser_width': null,
            'session_hash': null,
            'user_agent': null,
            'latitude': null,
            'longitude': null
          }
        }),
        // The time the order was closed at.
        closed_at: {
          type: Sequelize.DATE
        },
        // The three letter code (ISO 4217) for the currency used for the payment.
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD'
        },
        // The customer's email address. Is required when a billing address is present.
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true
          }
        },
        // pending: The finances are pending.
        // authorized: The finances have been authorized.
        // partially_paid: The finances have been partially paid.
        // paid: The finances have been paid. (This is the default value.)
        // partially_refunded: The finances have been partially refunded.
        // refunded: The finances have been refunded.
        // voided: The finances have been voided.
        financial_status: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_FINANCIAL)
        },
        // fulfilled: the order has been completely fulfilled
        // none: the order has no fulfillments
        // partial: the order has some fulfillments
        fulfillment_status: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_FULFILLMENT),
          defaultValue: ORDER_FULFILLMENT.NONE
        },
        // The gateway used to create transactions
        gateway: {
          type: Sequelize.STRING
        },
        // The site this sale originated from
        landing_site: {
          type: Sequelize.STRING
        },
        // Only present on orders processed at point of sale. The unique numeric identifier for the physical location at which the order was processed.
        location_id: {
          type: Sequelize.STRING
        },
        // The customer's order name as represented by a number.
        name: {
          type: Sequelize.STRING
        },
        // The text of an optional note that a shop owner can attach to the order.
        note: {
          type: Sequelize.STRING
        },
        // "note_attributes": ["name": "custom name","value": "custom value"]
        // Extra information that is added to the order. Each array entry must contain a hash with "name" and "value" keys as shown above.
        note_attributes: helpers.JSONB('order', app, Sequelize, 'note_attributes', {
          defaultValue: {}
        }),
        // Numerical identifier unique to the shop. A number is sequential and starts at 1000.
        number: {
          type: Sequelize.INTEGER
        },
        // A unique numeric identifier for the order. This one is used by the shop owner and customer. This is different from the id property, which is also a unique numeric identifier for the order, but used for API purposes.
        order_number: {
          type: Sequelize.STRING
        },
        // The list of all payment gateways used for the order.
        payment_gateway_names: helpers.ARRAY('order', app, Sequelize, Sequelize.STRING, 'payment_gateway_names', {
          defaultValue: []
        }),
        // The date and time when the order was imported, in ISO 8601 format. This value can be set to dates in the past when importing from other systems. If no value is provided, it will be auto-generated.
        processed_at: {
          type: Sequelize.DATE
        },
        // States the type of payment processing method. Valid values are: checkout, direct, manual, offsite or express.
        processing_method: {
          type: Sequelize.ENUM,
          values: _.values(PAYMENT_PROCESSING_METHOD)
        },
        // The website that the customer clicked on to come to the shop.
        referring_site: {
          type: Sequelize.STRING
        },
        // An array of shipping_line objects, each of which details the shipping methods used.
        shipping_lines: helpers.ARRAY('order', app, Sequelize, Sequelize.JSON, 'shipping_lines', {
          defaultValue: []
        }),
        // Where the order originated. May only be set during creation, and is not writable thereafter. Orders created through official Proxy Engine channels have protected values that cannot be assigned by other API clients during order creation. These protected values are: "web", "pos", "iphone", and "android" Orders created via the API may be assigned any other string of your choice. If source_name is unspecified, new orders are assigned the value "api".
        source_name: {
          type: Sequelize.STRING,
          defaultValue: 'api'
        },
        // Price of the order before shipping and taxes
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // An array of tax_line objects, each of which details the total taxes applicable to the order.
        tax_lines: helpers.ARRAY('order', app, Sequelize, Sequelize.JSON, 'tax_lines', {
          defaultValue: []
        }),
        // States whether or not taxes are included in the order subtotal. Valid values are "true" or "false".
        taxes_included: {
          type: Sequelize.BOOLEAN
        },
        // Unique identifier for a particular order.
        token: {
          type: Sequelize.STRING,
          unique: true
        },
        // The total amount of the discounts to be applied to the price of the order.
        total_discounts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the prices of all the items in the order.
        total_line_items_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the prices of all the items in the order, taxes and discounts included (must be positive).
        total_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the taxes applied to the order (must be positive).
        total_tax: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the weights of the line items in the order, in grams.
        total_weight: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The URL pointing to the order status web page. The URL will be null unless the order was created from a checkout.
        order_status_url: {
          type: Sequelize.STRING
        },
        // TODO Enable User or Owner
        // Only present on orders processed at point of sale. The unique numerical identifier for the user logged into the terminal at the time the order was processed at.
        // user_id: {
        //   type: Sequelize.INTEGER,
        //   references: {
        //     model: 'User',
        //     key: 'id'
        //   }
        // },
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

        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyEngine.live_mode
        }
      }
    }
    return schema
  }
}
