/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
const INTERVALS = require('../utils/enums').INTERVALS
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
const FULFILLMENT_SERVICE = require('../utils/enums').FULFILLMENT_SERVICE

/**
 * @module OrderItem
 * @description Order Item Model
 */
module.exports = class OrderItem extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          hooks: {
            beforeCreate(values, options, fn) {
              app.services.OrderService.itemBeforeCreate(values)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            beforeUpdate(values, options, fn) {
              app.services.OrderService.itemBeforeUpdate(values)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            afterCreate(values, options, fn) {
              app.services.OrderService.itemAfterCreate(values)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            afterUpdate(values, options, fn) {
              app.services.OrderService.itemAfterUpdate(values)
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
            FULFILLMENT_STATUS: FULFILLMENT_STATUS,
            FULFILLMENT_SERVICE: FULFILLMENT_SERVICE,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.OrderItem.belongsTo(models.Order, {

              })
              models.OrderItem.belongsTo(models.Fulfillment, {

              })
              models.OrderItem.belongsTo(models.Product, {

              })
              models.OrderItem.belongsTo(models.ProductVariant, {

              })
              models.OrderItem.belongsTo(models.Refund, {
                through: {
                  model: models.ItemRefund,
                  unique: false,
                  scope: {
                    model: 'order_item'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
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
        order_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Order',
          //   key: 'id'
          // },
          allowNull: false
        },
        fulfillment_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Fulfillment',
          //   key: 'id'
          // }
          // allowNull: false
        },
        product_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Product',
          //   key: 'id'
          // },
          allowNull: false
        },
        variant_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'ProductVariant',
          //   key: 'id'
          // },
          allowNull: false
        },
        subscription_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Subscription',
          //   key: 'id'
          // }
        },
        // The amount available to fulfill. This is the quantity - max(refunded_quantity, fulfilled_quantity) - pending_fulfilled_quantity - open_fulfilled_quantity.
        fulfillable_quantity: {
          type: Sequelize.INTEGER
        },
        // The maximum allowed per order.
        max_quantity: {
          type: Sequelize.INTEGER
        },
        // Service provider who is doing the fulfillment. Valid values are either "manual" or the name of the provider. eg: "amazon", "shipwire", etc.
        fulfillment_service: {
          type: Sequelize.STRING,
          defaultValue: FULFILLMENT_SERVICE.MANUAL
        },
        // How far along an order is in terms line items fulfilled. Valid values are: fulfilled, null or partial.
        fulfillment_status: {
          type: Sequelize.ENUM,
          values: _.values(FULFILLMENT_STATUS),
          defaultValue: FULFILLMENT_STATUS.NONE
        },
        // The weight of the item in grams.
        grams: {
          type: Sequelize.INTEGER
        },
        // The price of the item before discounts have been applied.
        price: {
          type: Sequelize.INTEGER
        },
        // The price of the item after discounts have been applied.
        calculated_price: {
          type: Sequelize.INTEGER
        },
        // The unique numeric identifier for the product in the fulfillment. Can be null if the original product associated with the order is deleted at a later date
        // The number of products that were purchased.
        quantity: {
          type: Sequelize.INTEGER
        },
        // States whether or not the fulfillment requires shipping. Values are: true or false.
        requires_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // States whether or not the order item requires a subscription. Values are: true or false.
        requires_subscription: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // If Product has subscription, the interval of the subscription, defaults to 0 months
        subscription_interval: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // If product has subscription, the unit of the interval
        subscription_unit: {
          type: Sequelize.ENUM,
          values: _.values(INTERVALS),
          defaultValue: INTERVALS.NONE
        },
        // A unique identifier of the item in the fulfillment.
        sku: {
          type: Sequelize.STRING
        },
        // The type of Product
        type: {
          type: Sequelize.STRING
        },
        // The title of the product.
        title: {
          type: Sequelize.STRING
        },
        // The title of the product variant.
        variant_title: {
          type: Sequelize.STRING
        },
        // The name of the supplier of the item.
        vendor: {
          type: Sequelize.STRING
        },
        // The name of the product variant.
        name: {
          type: Sequelize.STRING
        },
        // States whether or not the line_item is a gift card. If so, the item is not taxed or considered for shipping charges.
        gift_card: {
          type: Sequelize.BOOLEAN
        },
        // An array of custom information for an item that has been added to the cart. Often used to provide product customization options. For more information, see the documentation on collecting customization information on the product page.
        properties: helpers.ARRAY('OrderItem', app, Sequelize, Sequelize.STRING, 'properties', {
          defaultValue: []
        }),
        // States whether or not the product was taxable. Values are: true or false.
        taxable: {
          type: Sequelize.BOOLEAN
        },
        tax_code: {
          type: Sequelize.STRING,
          defaultValue: 'P000000' // Physical Good
        },
        // The line_items that have discounts
        discounted_lines: helpers.ARRAY('OrderItem', app, Sequelize, Sequelize.JSON,  'discounted_lines', {
          defaultValue: []
        }),
        // The line_items that have discounts
        coupon_lines: helpers.ARRAY('OrderItem', app, Sequelize, Sequelize.JSON,  'coupon_lines', {
          defaultValue: []
        }),
        // The line_items that have shipping
        shipping_lines: helpers.ARRAY('OrderItem', app, Sequelize, Sequelize.JSON,  'shipping_lines', {
          defaultValue: []
        }),
        // A list of tax_line objects, each of which details the taxes applicable to this line_item.
        tax_lines: helpers.ARRAY('OrderItem', app, Sequelize, Sequelize.JSON, 'tax_lines', {
          defaultValue: []
        }),
        // The total discounts amount applied to this line item. This value is not subtracted in the line item price.
        total_discounts: {
          type: Sequelize.INTEGER
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
