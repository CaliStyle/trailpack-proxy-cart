'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
const FULFILLMENT_SERVICE = require('../utils/enums').FULFILLMENT_SERVICE
/**
 * @module Fulfillment
 * @description Fulfillment Model
 */
module.exports = class Fulfillment extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          hooks: {
            afterCreate: (values, options, fn) => {
              const Order = app.orm['Order']
              Order.findById(values.order_id)
                .then(order => {
                  return order.resolveFulfillmentStatus()
                })
                .then(order => {
                  fn(null, values)
                })
                .catch(err => {
                  fn(err, values)
                })
            }
          },
          classMethods: {
            FULFILLMENT_STATUS: FULFILLMENT_STATUS,
            FULFILLMENT_SERVICE: FULFILLMENT_SERVICE,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // models.Fulfillment.belongsTo(models.Order, {
              //   // as: 'order_id'
              // })
              models.Fulfillment.hasMany(models.OrderItem, {
                as: 'order_items'
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
        order_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Order',
            key: 'id'
          },
          allowNull: false
        },
        receipt: {
          type: Sequelize.STRING
        },
        //The status of the fulfillment.
        // fulfilled, none, partial
        status: {
          type: Sequelize.ENUM,
          values: _.values(FULFILLMENT_STATUS),
          defaultValue: FULFILLMENT_STATUS.NONE
        },
        service: {
          type: Sequelize.STRING,
          defaultValue: FULFILLMENT_SERVICE.MANUAL
        },
        //The name of the shipping company.
        tracking_company: {
          type: Sequelize.STRING
        },
        //The shipping number, provided by the shipping company.
        tracking_number: {
          type: Sequelize.STRING
        },

        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyEngine.live_mode
        }
      }
    }
    return schema
  }
}
