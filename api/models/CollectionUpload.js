/* eslint new-cap: [0] */

'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
// const helpers = require('proxy-engine-helpers')
const COLLECTION_SORT_ORDER = require('../utils/enums').COLLECTION_SORT_ORDER
const COLLECTION_PURPOSE = require('../utils/enums').COLLECTION_PURPOSE
const COLLECTION_DISCOUNT_SCOPE = require('../utils/enums').COLLECTION_DISCOUNT_SCOPE
const COLLECTION_DISCOUNT_TYPE = require('../utils/enums').COLLECTION_DISCOUNT_TYPE
const COLLECTION_TAX_TYPE = require('../utils/enums').COLLECTION_TAX_TYPE

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
          COLLECTION_DISCOUNT_SCOPE: COLLECTION_DISCOUNT_SCOPE,
          COLLECTION_DISCOUNT_TYPE: COLLECTION_DISCOUNT_TYPE,
          COLLECTION_TAX_TYPE: COLLECTION_TAX_TYPE,
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
        type: Sequelize.STRING,
        allowNull: false
      },
      handle: {
        type: Sequelize.STRING,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
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
      position: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      sort_order: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_SORT_ORDER),
        defaultValue: COLLECTION_SORT_ORDER.ALPHA_DESC
      },
      tax_rate: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      tax_percentage: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      tax_type: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_TAX_TYPE),
        defaultValue: COLLECTION_TAX_TYPE.PERCENTAGE
      },
      tax_name: {
        type: Sequelize.STRING
      },
      discount_scope: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_DISCOUNT_SCOPE),
        defaultValue: COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL
      },
      discount_type: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_DISCOUNT_TYPE),
        defaultValue: COLLECTION_DISCOUNT_TYPE.PERCENTAGE
      },
      discount_rate: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      discount_percentage: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      // List of product types allowed to discount
      discount_product_include: helpers.JSONB('CollectionUpload', app, Sequelize, 'discount_product_include', {
        defaultValue: []
      }),
      // List of product types to forcefully excluded from discount
      discount_product_exclude: helpers.JSONB('CollectionUpload', app, Sequelize, 'discount_product_exclude', {
        defaultValue: []
      }),
      images: helpers.JSONB('CollectionUpload', app, Sequelize, 'images', {
        defaultValue: []
      }),
      collections: helpers.JSONB('CollectionUpload', app, Sequelize, 'collections', {
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
