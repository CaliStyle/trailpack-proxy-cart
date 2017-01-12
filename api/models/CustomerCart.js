'use strict'

const Model = require('trails/model')

/**
 * @module CustomerCart
 * @description Customer Cart Model n:m
 */
module.exports = class CustomerCart extends Model {

  static config (app, Sequelize) {
    const config = {
      options: {
        underscored: true
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        cart_id: {
          type: Sequelize.INTEGER,
          unique: 'customercart_cart'
        },
        cart: {
          type: Sequelize.STRING,
          unique: 'customercart_cart'
        },
        customer_id: {
          type: Sequelize.INTEGER,
          unique: 'customercart_cart',
          references: null
        }
      }
    }
    return schema
  }
}
