/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

/**
 * @module ProductMetaUpload
 * @description Product Meta Upload
 */
module.exports = class ProductMetaUpload extends Model {

  static config (app, Sequelize) {
    const config = {
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
      upload_id: {
        type: Sequelize.STRING
      },
      handle: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Product',
          key: 'handle'
        }
      },
      data: helpers.JSON('productmetaupload', app, Sequelize, 'data', {
        defaultValue: {}
      })
    }
    return schema
  }
}
