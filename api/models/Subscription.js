'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const INTERVALS = require('../utils/enums').INTERVALS
const SUBSCRIPTION_CANCEL = require('../utils/enums').SUBSCRIPTION_CANCEL
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
            INTERVALS: INTERVALS,
            SUBSCRIPTION_CANCEL: SUBSCRIPTION_CANCEL,
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
                // as: 'order_id'
              })
              // // The Subscription Product
              // models.Subscription.belongsTo(models.Product, {
              //   // as: 'product_id'
              // })
              // The Subscription Product Variant
              models.Subscription.belongsTo(models.ProductVariant, {
                // as: 'product_variant_id'
              })
              // The collection of subscriptions for a given customer
              models.Subscription.belongsToMany(models.Collection, {
                as: 'collections',
                through: {
                  model: models.ItemCollection,
                  unique: false,
                  scope: {
                    model: 'subscription'
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
        // The interval of the subscription, defaults to 0 months
        interval: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The unit of the interval
        unit: {
          type: Sequelize.ENUM,
          values: _.values(INTERVALS),
          defaultValue: INTERVALS.NONE
        },
        // Active Subscription
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // The reason why the subscription was cancelled. If the subscription was not cancelled, this value is "null."
        cancel_reason: {
          type: Sequelize.ENUM,
          values: _.values(SUBSCRIPTION_CANCEL)
        },
        cancelled_at: {
          type: Sequelize.DATE
        },
        // Live Mode
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyEngine.live_mode
        }
      }
    }
    return schema
  }
}
