/* eslint new-cap: [0] */

'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
const INTERVALS = require('../utils/enums').INTERVALS
// const SUBSCRIPTION_CANCEL = require('../utils/enums').SUBSCRIPTION_CANCEL

/**
 * @module SubscriptionUpload
 * @description Subscription Upload Model
 */
module.exports = class SubscriptionUpload extends Model {

  static config (app, Sequelize) {
    const config = {
      migrate: 'drop', //override default models configurations if needed
      store: 'uploads',
      options: {
        underscored: true,
        classMethods: {
          /**
           *
           * @param options
           * @param batch
           * @returns Promise.<T>
           */
          batch: function (options, batch) {
            const self = this
            options.limit = options.limit || 10
            options.offset = options.offset || 0
            options.regressive = options.regressive || false

            const recursiveQuery = function(options) {
              let count = 0
              return self.findAndCountAll(options)
                .then(results => {
                  count = results.count
                  return batch(results.rows)
                })
                .then(batched => {
                  if (count >= (options.regressive ? options.limit : options.offset + options.limit)) {
                    options.offset = options.regressive ? 0 : options.offset + options.limit
                    return recursiveQuery(options)
                  }
                  else {
                    return batched
                  }
                })
            }
            return recursiveQuery(options)
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      // Upload ID
      upload_id: {
        type: Sequelize.STRING
      },
      // Token: prior subscription token
      token: {
        type: Sequelize.STRING
      },
      // Customer: customer email
      customer: {
        type: Sequelize.STRING
      },

      // The interval of the subscription, defaults to 1 months
      interval: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      // The unit of the interval
      unit: {
        type: Sequelize.ENUM,
        values: _.values(INTERVALS),
        defaultValue: INTERVALS.MONTH
      },
      // Active Subscription
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // Products
      products: helpers.JSONB('SubscriptionUpload', app, Sequelize, 'products', {
        defaultValue: []
      }),
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
    return schema
  }
}
