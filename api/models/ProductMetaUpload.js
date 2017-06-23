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
          },
          associate: (models) => {
            // models.ProductMetaUpload.belongsTo(models.Product, {
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
      handle: {
        type: Sequelize.STRING,
        allowNull: false
        // references: {
        //   model: 'Product',
        //   key: 'handle'
        // }
      },
      data: helpers.JSONB('ProductMetaUpload', app, Sequelize, 'data', {
        defaultValue: {}
      }),
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
    return schema
  }
}
