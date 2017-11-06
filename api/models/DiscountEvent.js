/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
// const helpers = require('proxy-engine-helpers')

/**
 * @module CustomerAccount
 * @description Customer Account
 */
module.exports = class DiscountEvent extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        associate: (models) => {
          models.DiscountEvent.belongsTo(models.Discount, {
            foreignKey: 'discount_id'
          })

          models.DiscountEvent.belongsTo(models.Customer, {
            foreignKey: 'customer_id'
          })

          models.DiscountEvent.belongsTo(models.Order, {
            foreignKey: 'order_id'
          })
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      discount_id: {
        type: Sequelize.INTEGER
      },
      customer_id: {
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    }
  }
}
