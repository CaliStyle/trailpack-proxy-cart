/* eslint new-cap: [0] */

'use strict'
const Model = require('trails/model')
const _ = require('lodash')
// const helpers = require('proxy-engine-helpers')
const COLLECTION_SORT_ORDER = require('../utils/enums').COLLECTION_SORT_ORDER
const COLLECTION_PURPOSE = require('../utils/enums').COLLECTION_PURPOSE

/**
 * @module CollectionUpload
 * @description Collection Upload Model
 */
module.exports = class CollectionUpload extends Model {

  static config (app, Sequelize) {
    const config = {
      migrate: 'drop', //override default models configurations if needed
      store: 'uploads',
      options: {
        underscored: true,
        classMethods: {
          COLLECTION_PURPOSE: COLLECTION_PURPOSE,
          COLLECTION_SORT_ORDER: COLLECTION_SORT_ORDER,
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
      handle: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.TEXT
      },
      published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      primary_purpose: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_PURPOSE),
        defaultValue: COLLECTION_PURPOSE.GROUP
      },
      sort_order: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_SORT_ORDER),
        defaultValue: COLLECTION_SORT_ORDER.ALPHA_DESC
      }
    }
    return schema
  }
}