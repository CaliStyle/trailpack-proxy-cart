/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
// const _ = require('lodash')

/**
 * @module OrderUpload
 * @description Order Upload
 */
module.exports = class OrderUpload extends Model {

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
            options.limit = options.limit || 100
            options.offset = options.offset || 0

            const recursiveQuery = function(options) {
              let count = 0
              return self.findAndCountAll(options)
                .then(results => {
                  count = results.count
                  return batch(results.rows)
                })
                .then(batched => {
                  if (count > options.offset + options.limit) {
                    options.offset = options.offset + options.limit
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
      // Customer: customer email
      customer: {
        type: Sequelize.STRING
      },
      // Products
      products: helpers.ARRAY('OrderUpload', app, Sequelize, Sequelize.JSON, 'products', {
        defaultValue: []
      })
    }
    return schema
  }
}
