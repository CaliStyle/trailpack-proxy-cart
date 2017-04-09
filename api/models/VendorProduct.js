'use strict'

const Model = require('trails/model')

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
        }
      }
    }
    return schema
  }
}
