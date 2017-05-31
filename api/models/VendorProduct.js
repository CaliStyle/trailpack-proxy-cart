'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const INVENTORY_POLICY = require('../utils/enums').INVENTORY_POLICY
/**
 * @module VendorProduct
 * @description Vendor Product Join Table
 */
module.exports = class VendorProduct extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        vendor_id: {
          type: Sequelize.INTEGER,
          unique: 'vendor_product'
        },
        product_id: {
          type: Sequelize.STRING,
          unique: 'vendor_product'
        },
        // Specifies whether or not Proxy Cart tracks the number of items in stock for this product variant.
        inventory_management: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // Specifies whether or not customers are allowed to place an order for a product variant when it's out of stock.
        inventory_policy: {
          type: Sequelize.ENUM,
          values: _.values(INVENTORY_POLICY),
          defaultValue: INVENTORY_POLICY.DENY
        },
        // Amount of variant in inventory
        inventory_quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The average amount of days to come in stock if out of stock
        inventory_lead_time: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }
      }
    }
    return schema
  }
}
