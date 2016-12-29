/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

/**
 * @module Metadata
 * @description Metadata Model
 */
module.exports = class Metadata extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Metadata.belongsTo(models.Product, {
                through: {
                  model: models.ItemMetadata,
                  unique: false
                },
                foreignKey: 'meta_id',
                constraints: false
              })
              models.Metadata.belongsTo(models.Customer, {
                through: {
                  model: models.ItemMetadata,
                  unique: false
                },
                foreignKey: 'meta_id',
                constraints: false
              })
              // models.Metadata.belongsTo(models.Customer, {
              //   // as: 'customer_id'
              // })
              // models.Metadata.belongsTo(models.Product, {
              //   // as: 'customer_id'
              // })
              // models.Metadata.belongsTo(models.ProductCollection, {
              //   // as: 'customer_id'
              // })
            },
            transform: function (metadata) {
              if (typeof metadata.data !== 'undefined') {
                return metadata
              }
              return { data: metadata }
            },
            reverseTransform: function (metadata) {
              if (typeof metadata.data !== 'undefined') {
                return metadata.data
              }
              return metadata
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
        data: helpers.JSONB('metadata', app, Sequelize, 'data', {
          defaultValue: {}
        }),
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
