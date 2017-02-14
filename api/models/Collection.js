'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const COLLECTION_SORT_ORDER = require('../utils/enums').COLLECTION_SORT_ORDER
/**
 * @module ProductCollection
 * @description Product Collection Model
 */
module.exports = class Collection extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          hooks: {
            beforeValidate(values, options, fn) {
              if (!values.handle && values.title) {
                values.handle = values.title
              }
              // if (values.handle) {
              //   values.handle = app.services.ProxyCartService.slug(values.handle)
              // }
              // if (!values.handle && values.title) {
              //   values.handle = app.services.ProxyCartService.slug(values.title)
              // }
              fn()
            }
          },
          classMethods: {
            COLLECTION_SORT_ORDER: COLLECTION_SORT_ORDER,
            /**
             *
             * @param models
             */
            associate: (models) => {
              models.Collection.belongsToMany(models.Product, {
                through: {
                  model: models.ItemCollection,
                  unique: false
                },
                foreignKey: 'collection_id'
              })
              // models.Collection.belongsToMany(models.ProductVariant, {
              //   through: {
              //     model: models.ItemCollection,
              //     unique: false
              //   },
              //   foreignKey: 'collection_id'
              // })
              // models.ProductCollection.hasMany(models.ProductCollection, {
              //   as: 'collections'
              // })
              // models.ProductCollection.hasMany(models.Product, {
              //   as: 'products'
              // })
              // models.ProductCollection.hasMany(models.ProductImage, {
              //   as: 'images'
              // })
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
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          set: function(val) {
            this.setDataValue('handle', app.services.ProxyCartService.slug(val))
          }
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        // Multi Site Support
        // TODO possibly switch to store_id for multi tenant support?
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
        sort_order: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_SORT_ORDER),
          defaultValue: COLLECTION_SORT_ORDER.ALPHA_DESC
        },

        // TODO Tax Percentage Override
        tax_rate: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        tax_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        tax_type: {
          type: Sequelize.STRING
        },
        tax_name: {
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
