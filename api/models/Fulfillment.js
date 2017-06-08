/* eslint no-console: [0] */
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
            beforeCreate: (values, options, fn) => {
              app.services.FulfillmentService.beforeCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            beforeUpdate: (values, options, fn) => {
              app.services.FulfillmentService.beforeUpdate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            afterCreate: (values, options, fn) => {
              app.services.FulfillmentService.afterCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            afterUpdate: (values, options, fn) => {
              app.services.FulfillmentService.afterUpdate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
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
              //   // as: 'order_id',
              //   // allowNull: false
              // })
              models.Fulfillment.hasMany(models.OrderItem, {
                foreignKey: 'fulfillment_id',
                as: 'order_items'
              })
            },
            resolve: function(fulfillment, options){
              // options = options || {}
            }
          },
          instanceMethods: {
            resolveFulfillmentStatus: function() {
              const OrderItem = app.orm['OrderItem']
              if (!this.id){
                return Promise.resolve(this)
              }
              return OrderItem.findAll({
                where: {
                  fulfillment_id: this.id
                }
              })
                .then(orderItems => {
                  this.setFulfillmentStatus(orderItems)
                  return this
                })
            },
            setFulfillmentStatus: function(orderItems){
              console.log('THIS STATUS', this.status)
              let fulfillmentStatus = FULFILLMENT_STATUS.NONE
              let totalFulfillments = 0
              let totalPartialFulfillments = 0
              let totalSentFulfillments = 0
              let totalNonFulfillments = 0

              orderItems.forEach(item => {
                if (item.fulfillment_status == FULFILLMENT_STATUS.FULFILLED) {
                  totalFulfillments++
                }
                else if (item.fulfillment_status == FULFILLMENT_STATUS.PARTIAL) {
                  totalPartialFulfillments++
                }
                else if (item.fulfillment_status == FULFILLMENT_STATUS.SENT) {
                  totalSentFulfillments++
                }
                else if (item.fulfillment_status == FULFILLMENT_STATUS.NONE) {
                  totalNonFulfillments++
                }
              })

              if (totalFulfillments == orderItems.length) {
                fulfillmentStatus = FULFILLMENT_STATUS.FULFILLED
              }
              else if (totalSentFulfillments == orderItems.length) {
                fulfillmentStatus = FULFILLMENT_STATUS.SENT
              }
              else if (totalPartialFulfillments > 0) {
                fulfillmentStatus = FULFILLMENT_STATUS.PARTIAL
              }
              else if (totalNonFulfillments == orderItems.length) {
                fulfillmentStatus = FULFILLMENT_STATUS.NONE // back to default
              }

              this.status = fulfillmentStatus
              return this
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
          // references: {
          //   model: 'Order',
          //   key: 'id'
          // },
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
        // The URL pointing to the order status web page.
        status_url: {
          type: Sequelize.STRING
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
