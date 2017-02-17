'use strict'

const Model = require('trails/model')

/**
 * @module CustomerOrder
 * @description Customer Order
 */
module.exports = class CustomerOrder extends Model {

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
        order_id: {
          type: Sequelize.INTEGER,
          unique: 'customerorder_order'
        },
        // order: {
        //   type: Sequelize.STRING,
        //   unique: 'customerorder_order'
        // },
        customer_id: {
          type: Sequelize.INTEGER,
          unique: 'customerorder_order',
          references: null
        }
      }
    }
    return schema
  }
}
