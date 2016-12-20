'use strict'

const Model = require('trails/model')

/**
 * @module Subscription
 * @description Subscription Model
 */
module.exports = class Subscription extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // The customer this subscription belongs to
              models.Subscription.belongsTo(models.Customer, {
                // as: 'customer_id'
              })
              // The Order that Created this Subscription
              models.Subscription.belongsTo(models.Order, {
                // as: 'customer_id'
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
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
