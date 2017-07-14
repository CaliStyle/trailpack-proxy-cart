/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const queryDefaults = require('../utils/queryDefaults')
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
          // defaultScope: {
          //   where: {
          //     live_mode: app.config.proxyEngine.live_mode
          //   }
          // },
          scopes: {
            none: {
              where: {
                status: FULFILLMENT_STATUS.NONE
              }
            },
            pending: {
              where: {
                status: FULFILLMENT_STATUS.PENDING
              }
            },
            sent: {
              where: {
                status: FULFILLMENT_STATUS.SENT
              }
            },
            partial: {
              where: {
                status: FULFILLMENT_STATUS.PARTIAL
              }
            },
            fulfilled: {
              where: {
                status: FULFILLMENT_STATUS.FULFILLED
              }
            },
            cancelled: {
              where: {
                status: FULFILLMENT_STATUS.CANCELLED
              }
            },
          },
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
            findByIdDefault: function(id, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Fulfillment.default(app))
              return this.findById(id, options)
            },
            findAndCountDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Fulfillment.default(app))
              return this.findAndCount(options)
            },
            resolve: function(fulfillment, options){
              const Fulfillment =  this
              if (fulfillment instanceof Fulfillment.Instance){
                return Promise.resolve(fulfillment)
              }
              else if (fulfillment && _.isObject(fulfillment) && fulfillment.id) {
                return Fulfillment.findByIdDefault(fulfillment.id, options)
                  .then(resFulfillment => {
                    if (!resFulfillment) {
                      throw new Errors.FoundError(Error(`Fulfillment ${fulfillment.id} not found`))
                    }
                    return resFulfillment
                  })
              }
              else if (fulfillment && (_.isString(fulfillment) || _.isNumber(fulfillment))) {
                return Fulfillment.findByIdDefault(fulfillment, options)
                  .then(resFulfillment => {
                    if (!resFulfillment) {
                      throw new Errors.FoundError(Error(`Fulfillment ${fulfillment} not found`))
                    }
                    return resFulfillment
                  })
              }
              else {
                const err = new Error('Unable to resolve Fulfillment')
                return Promise.reject(err)
              }
            }
          },
          instanceMethods: {
            pending: function() {
              return this
            },
            none: function() {
              return this
            },
            partial: function() {
              return this
            },
            sent: function() {
              this.sent_at = new Date(Date.now())
              this.status = FULFILLMENT_STATUS.SENT
              return this
            },
            fulfilled: function() {
              this.fulfilled_at = new Date(Date.now())
              this.status = FULFILLMENT_STATUS.FULFILLED
              return this
            },
            cancelled: function() {
              this.cancelled_at = new Date(Date.now())
              this.status = FULFILLMENT_STATUS.CANCELLED
              return this
            },
            resolveOrderItems: function(options) {
              options = options || {}
              if (this.order_items) {
                return Promise.resolve(this)
              }
              else {
                return this.getOrder_items({transaction: options.transaction || null})
                  .then(orderItems => {

                    orderItems = orderItems || []
                    this.order_items = orderItems
                    this.setDataValue('order_items', orderItems)
                    this.set('order_items', orderItems)
                    return this
                  })
              }
            },
            resolveFulfillmentStatus: function(options) {
              options = options || {}
              // let currentStatus, previousStatus
              if (!this.id){
                return Promise.resolve(this)
              }
              return this.resolveOrderItems({transaction: options.transaction || null})
                .then(() => {
                  this.setFulfillmentStatus()
                  // if (this.changed('status')) {
                  //   currentStatus = this.status
                  //   previousStatus = this.previous('status')
                  // }
                  // console.log('BROKE resolve', previousStatus, currentStatus)
                  return this
                })
                // .then(() => {
                //   if (currentStatus && previousStatus) {
                //     const event = {
                //       object_id: this.id,
                //       object: 'fulfillment',
                //       objects: [{
                //         order: this.order_id
                //       }],
                //       type: `order.financial_status.${currentStatus}`,
                //       message: `Order ${ this.name || 'ID ' + this.id } financial status changed from "${previousStatus}" to "${currentStatus}"`,
                //       data: this
                //     }
                //     return app.services.ProxyEngineService.publish(event.type, event, {save: true})
                //   }
                //   else {
                //     return
                //   }
                // })
                // .then(() => {
                //   return this
                // })
            },
            saveFulfillmentStatus: function (options) {
              options = options || {}
              return this.resolveOrderItems(options)
                .then(() => {
                  this.setFulfillmentStatus()
                  return this.save({transaction: options.transaction || null})
                })
            },
            setFulfillmentStatus: function(){
              if (!this.order_items) {
                throw new Error('Fulfillment.setFulfillmentStatus requires order_items to be populated')
              }

              let fulfillmentStatus = FULFILLMENT_STATUS.PENDING
              let totalFulfillments = 0
              let totalPartialFulfillments = 0
              let totalSentFulfillments = 0
              let totalNonFulfillments = 0
              let totalPendingFulfillments = 0
              let totalCancelledFulfillments = 0
              let totalQty = 0

              this.order_items.forEach(item => {
                totalQty = totalQty + item.quantity

                if (item.fulfillment_status == FULFILLMENT_STATUS.FULFILLED) {
                  totalFulfillments = totalFulfillments + item.quantity
                }
                else if (item.fulfillment_status == FULFILLMENT_STATUS.PARTIAL) {
                  totalPartialFulfillments = totalPartialFulfillments + item.quantity
                }
                else if (item.fulfillment_status == FULFILLMENT_STATUS.SENT) {
                  totalSentFulfillments = totalSentFulfillments + item.quantity
                }
                else if (item.fulfillment_status == FULFILLMENT_STATUS.PENDING) {
                  totalPendingFulfillments = totalPendingFulfillments + item.quantity
                }
                else if (item.fulfillment_status == FULFILLMENT_STATUS.NONE) {
                  totalNonFulfillments = totalNonFulfillments + item.quantity
                }
                else if (item.fulfillment_status == FULFILLMENT_STATUS.CANCELLED) {
                  totalCancelledFulfillments = totalCancelledFulfillments + item.quantity
                }
              })

              if (totalFulfillments == totalQty && totalQty > 0) {
                fulfillmentStatus = FULFILLMENT_STATUS.FULFILLED
              }
              else if (totalSentFulfillments == totalQty && totalQty > 0) {
                fulfillmentStatus = FULFILLMENT_STATUS.SENT
              }
              else if (totalPartialFulfillments > 0 && totalQty > 0) {
                fulfillmentStatus = FULFILLMENT_STATUS.PARTIAL
              }
              else if (totalPendingFulfillments == totalQty && totalQty > 0) {
                fulfillmentStatus = FULFILLMENT_STATUS.PENDING // back to default
              }
              else if (totalNonFulfillments == totalQty && totalQty > 0) {
                fulfillmentStatus = FULFILLMENT_STATUS.NONE // back to default
              }
              else if (totalCancelledFulfillments == totalQty && totalQty > 0) {
                fulfillmentStatus = FULFILLMENT_STATUS.CANCELLED
              }

              this.status = fulfillmentStatus
              this.total_items = totalQty
              this.total_fulfilled = totalFulfillments
              this.total_sent_to_fulfillment = totalSentFulfillments
              this.total_pending_fulfillments = totalPendingFulfillments
              this.total_cancelled = totalCancelledFulfillments
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
          defaultValue: FULFILLMENT_STATUS.PENDING
        },
        // The total items in this instance
        total_items: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Total Order Items Fulfilled
        total_fulfilled: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Total Order Items Sent to Fulfillment
        total_sent_to_fulfillment: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Total Order Items Cancelled by Fulfillment
        total_cancelled: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Total Order Items not Fulfilled
        total_pending_fulfillments: {
          type: Sequelize.INTEGER,
          defaultValue: 0
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
        },
        sent_at: {
          type: Sequelize.DATE
        },
        fulfilled_at: {
          type: Sequelize.DATE
        },
        cancelled_at: {
          type: Sequelize.DATE
        }
      }
    }
    return schema
  }
}
