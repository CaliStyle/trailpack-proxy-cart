/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('../utils/helpers')
const _ = require('lodash')
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
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
          classMethods: {
            FULFILLMENT_STATUS: FULFILLMENT_STATUS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.OrderItem.belongsTo(models.Product, {

              })
              models.OrderItem.belongsTo(models.ProductVariant, {

              })
              models.OrderItem.belongsTo(models.Order, {

              })
              models.OrderItem.belongsTo(models.Fulfillment, {

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
        // The amount available to fulfill. This is the quantity - max(refunded_quantity, fulfilled_quantity) - pending_fulfilled_quantity - open_fulfilled_quantity.
        fulfillable_quantity: {
          type: Sequelize.INTEGER
        },
        // Service provider who is doing the fulfillment. Valid values are either "manual" or the name of the provider. eg: "amazon", "shipwire", etc.
        fulfillment_service: {
          type: Sequelize.STRING
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
        // The unique numeric identifier for the product in the fulfillment. Can be null if the original product associated with the order is deleted at a later date
        // The number of products that were purchased.
        quantity: {
          type: Sequelize.INTEGER
        },
        // States whether or not the fulfillment requires shipping. Values are: true or false.
        requires_shipping: {
          type: Sequelize.BOOLEAN
        },
        // A unique identifier of the item in the fulfillment.
        sku: {
          type: Sequelize.STRING
        },
        // The title of the product.
        title: {
          type: Sequelize.STRING
        },
        // The id of the product variant.
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
        properties: helpers.ARRAY('customer', app, Sequelize, Sequelize.STRING, 'tags', {
          defaultValue: []
        }),
        // States whether or not the product was taxable. Values are: true or false.
        taxable: {
          type: Sequelize.BOOLEAN
        },
        // A list of tax_line objects, each of which details the taxes applicable to this line_item.
        tax_lines: helpers.JSONB('orderitem', app, Sequelize, 'tax_lines', {
          defaultValue: {}
        }),
        // The total discount amount applied to this line item. This value is not subtracted in the line item price.
        total_discount: {
          type: Sequelize.INTEGER
        },

        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      }
    }
    return schema
  }
}
