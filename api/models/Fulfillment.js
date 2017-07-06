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
            resolveFulfillmentStatus: function() {
              // let currentStatus, previousStatus
              if (!this.id){
                return Promise.resolve(this)
              }
              return Promise.resolve()
                .then(() => {
                  if (!this.order_items) {
                    return this.getOrder_items()
                  }
                  else {
                    return this.order_items
                  }
                })
                .then(orderItems => {
                  orderItems = orderItems || []
                  this.set('order_items', orderItems)
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
                //       object: 'order',
                //       objects: [{
                //         customer: this.customer_id
                //       },{
                //         order: this.id
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
            setFulfillmentStatus: function(){
              if (!this.order_items) {
                throw new Error('Fulfillment.setFulfillmentStatus requires order_items to be populated')
              }

              let fulfillmentStatus = FULFILLMENT_STATUS.NONE
              let totalFulfillments = 0
              let totalPartialFulfillments = 0
              let totalSentFulfillments = 0
              let totalNonFulfillments = 0
              let totalCancelledFulfillments = 0

              this.order_items.forEach(item => {
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
                else if (item.fulfillment_status == FULFILLMENT_STATUS.CANCELLED) {
                  totalCancelledFulfillments++
                }
              })

              if (totalFulfillments == this.order_items.length) {
                fulfillmentStatus = FULFILLMENT_STATUS.FULFILLED
              }
              else if (totalSentFulfillments == this.order_items.length) {
                fulfillmentStatus = FULFILLMENT_STATUS.SENT
              }
              else if (totalPartialFulfillments > 0) {
                fulfillmentStatus = FULFILLMENT_STATUS.PARTIAL
              }
              else if (totalNonFulfillments == this.order_items.length) {
                fulfillmentStatus = FULFILLMENT_STATUS.NONE // back to default
              }
              else if (totalCancelledFulfillments == this.order_items.length) {
                fulfillmentStatus = FULFILLMENT_STATUS.CANCELLED // back to default
              }

              this.status = fulfillmentStatus
              this.total_fulfilled = totalFulfillments
              this.total_sent_to_fulfillment = totalSentFulfillments
              this.total_not_fulfilled = totalNonFulfillments
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
          defaultValue: FULFILLMENT_STATUS.NONE
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
        total_not_fulfilled: {
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
        }
      }
    }
    return schema
  }
}
