'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const COLLECTION_SORT_ORDER = require('../utils/enums').COLLECTION_SORT_ORDER
/**
 * @module ProductCollection
 * @description Product Collection Model
 */
module.exports = class ProductCollection extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            COLLECTION_SORT_ORDER: COLLECTION_SORT_ORDER,
            associate: (models) => {
              // models.ProductCollection.hasMany(models.ProductCollection, {
              //   as: 'collections'
              // })
              models.ProductCollection.hasMany(models.Product, {
                as: 'products'
              })
              models.ProductCollection.hasMany(models.ProductImage, {
                as: 'images'
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
        handle: {
          type: Sequelize.STRING
        },
        // Multi Site Support
        host: {
          type: Sequelize.STRING,
          defaultValue: 'localhost'
        },
        body: {
          type: Sequelize.TEXT
        },
        published: {
          type: Sequelize.BOOLEAN
        },
        published_at: {
          type: Sequelize.DATE
        },
        published_scope: {
          type: Sequelize.STRING
        },
        unpublished_at: {
          type: Sequelize.DATE
        },
        title: {
          type: Sequelize.STRING
        },
        sort_order: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_SORT_ORDER),
          defaultValue: COLLECTION_SORT_ORDER.ALPHA_DESC
        },

        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
