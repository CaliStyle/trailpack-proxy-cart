'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const ACCOUNT_EVENT_TYPE = require('../../lib').Enums.ACCOUNT_EVENT_TYPE
/**
 * @module AccountEvent
 * @description Saves Account Balance updates to accounts/customer

 */
module.exports = class AccountEvent extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        associate: (models) => {
          models.AccountEvent.belongsTo(models.Account, {
            foreignKey: 'account_id'
          })

          models.AccountEvent.belongsTo(models.Customer, {
            foreignKey: 'customer_id'
          })

          models.AccountEvent.belongsTo(models.Order, {
            foreignKey: 'order_id'
          })
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      // The account for the event
      account_id: {
        type: Sequelize.INTEGER
      },
      // The customer for the event
      customer_id: {
        type: Sequelize.INTEGER
      },
      // The order for the event
      order_id: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM,
        values: _.values(ACCOUNT_EVENT_TYPE),
      },
      // The amount of the credit or debit
      price: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    }
  }
}
