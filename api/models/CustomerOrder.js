'use strict'

const Model = require('trails/model')

/**
 * @module CustomerOrder
 * @description Customer Order
 */
module.exports = class CustomerOrder extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
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
}
