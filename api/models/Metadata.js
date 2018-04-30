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
    return {
      options: {
        underscored: true,
        scopes: {
          live: {
            where: {
              live_mode: true
            }
          }
        },
        indexes: [
          // Creates a gin index on data with the jsonb_path_ops operator
          {
            fields: ['data'],
            using: 'gin',
            operator: 'jsonb_path_ops'
          },
        ],
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          // TODO associate Metadata with product variant as well.
          associate: (models) => {
            // models.Metadata.belongsTo(models.Product, {
            //   scope: {
            //     model: 'product'
            //   },
            //   foreignKey: 'model_id',
            //   constraints: false
            // })
            // models.Metadata.belongsTo(models.ProductVariant, {
            //   scope: {
            //     model: 'product_variant'
            //   },
            //   foreignKey: 'model_id',
            //   constraints: false
            // })
            // models.Metadata.belongsTo(models.Customer, {
            //   scope: {
            //     model: 'customer'
            //   },
            //   foreignKey: 'model_id',
            //   constraints: false
            // })
            // models.Metadata.belongsTo(models.User, {
            //   scope: {
            //     model: 'user'
            //   },
            //   foreignKey: 'id',
            //   constraints: false
            // })
            // models.Metadata.belongsTo(models.Product, {
            //   through: {
            //     model: models.ItemMetadata,
            //     unique: false
            //   },
            //   foreignKey: 'meta_id',
            //   constraints: false
            // })
            // models.Metadata.belongsTo(models.Customer, {
            //   through: {
            //     model: models.ItemMetadata,
            //     unique: false
            //   },
            //   foreignKey: 'meta_id',
            //   constraints: false
            // })
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

  static schema (app, Sequelize) {
    return {
      // model: {
      //   type: Sequelize.STRING,
      //   // unique: 'metadata_model'
      // },
      // model_id: {
      //   type: Sequelize.INTEGER,
      //   // unique: 'metadata_model',
      //   // references: null
      // },
      data: helpers.JSONB('Metadata', app, Sequelize, 'data', {
        defaultValue: {}
      }),
      customer_id: {
        type: Sequelize.INTEGER
      },
      collection_id: {
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER
      },
      product_variant_id: {
        type: Sequelize.INTEGER
      },
      product_review_id: {
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER
      },
      order_item_id: {
        type: Sequelize.INTEGER
      },
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
