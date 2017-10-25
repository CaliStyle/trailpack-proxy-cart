'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const FULFILLMENT_EVENT_STATUS = require('../../lib').Enums.FULFILLMENT_EVENT_STATUS
/**
 * @module FulfillmentEvent
 * @description Fulfillment Event Model
 */
module.exports = class FulfillmentEvent extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        hooks: {
          beforeCreate: (values, options) => {
            return app.services.FulfillmentService.beforeEventCreate(values, options)
              .catch(err => {
                return Promise.reject(err)
              })
          },
          beforeUpdate: (values, options) => {
            return app.services.FulfillmentService.beforeEventUpdate(values, options)
              .catch(err => {
                return Promise.reject(err)
              })
          },
          afterCreate: (values, options) => {
            return app.services.FulfillmentService.afterEventCreate(values, options)
              .catch(err => {
                return Promise.reject(err)
              })
          },
          afterUpdate: (values, options) => {
            return app.services.FulfillmentService.afterEventUpdate(values, options)
              .catch(err => {
                return Promise.reject(err)
              })
          }
        },
        classMethods: {
          FULFILLMENT_EVENT_STATUS: FULFILLMENT_EVENT_STATUS,
          /**
           * Associate the Model
           * @param models
           */
          // associate: (models) => {
          //
          // }
          resolve: function(fulfillmentEvent, options){
            const FulfillmentEvent =  this
            if (fulfillmentEvent instanceof FulfillmentEvent){
              return Promise.resolve(fulfillmentEvent)
            }
            else if (fulfillmentEvent && _.isObject(fulfillmentEvent) && fulfillmentEvent.id) {
              return FulfillmentEvent.findById(fulfillmentEvent.id, options)
                .then(resFulfillmentEvent => {
                  if (!resFulfillmentEvent) {
                    throw new Errors.FoundError(Error(`FulfillmentEvent ${fulfillmentEvent.id} not found`))
                  }
                  return resFulfillmentEvent
                })
            }
            else if (fulfillmentEvent && (_.isString(fulfillmentEvent) || _.isNumber(fulfillmentEvent))) {
              return FulfillmentEvent.findById(fulfillmentEvent, options)
                .then(resFulfillmentEvent => {
                  if (!resFulfillmentEvent) {
                    throw new Errors.FoundError(Error(`FulfillmentEvent ${fulfillmentEvent} not found`))
                  }
                  return resFulfillmentEvent
                })
            }
            else {
              const err = new Error('Unable to resolve FulfillmentEvent')
              return Promise.reject(err)
            }
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      status: {
        type: Sequelize.ENUM,
        values: _.values(FULFILLMENT_EVENT_STATUS)
      },
      message: {
        type: Sequelize.STRING
      },
      address_1: {
        type: Sequelize.STRING
      },
      province: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      postal_code: {
        type: Sequelize.STRING
      },
      latitude: {
        type: Sequelize.FLOAT
      },
      longitude: {
        type: Sequelize.FLOAT
      }
    }
  }
}
