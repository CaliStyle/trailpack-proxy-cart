/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
// const helpers = require('proxy-engine-helpers')

/**
 * @module ProductAssociationUpload
 * @description Product Meta Upload
 */
module.exports = class ProductAssociationUpload extends Model {

  static config (app, Sequelize) {
    const config = {
      // migrate: 'drop', //override default models configurations if needed
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
          },
          associate: (models) => {
            // models.ProductAssociationUpload.belongsTo(models.Product, {
            //   as: 'handle',
            //   // targetKey: 'handle',
            //   foreignKey: 'handle',
            //   onDelete: 'CASCADE'
            //   // foreignKey: {
            //   //   allowNull: true
            //   // }
            // })
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      upload_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      product_handle: {
        type: Sequelize.STRING,
        allowNull: false
      },
      product_sku: {
        type: Sequelize.STRING,
        allowNull: true
      },
      associated_product_handle: {
        type: Sequelize.STRING,
        allowNull: false
      },
      associated_product_sku: {
        type: Sequelize.STRING,
        allowNull: true
      },
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
    return schema
  }
}
