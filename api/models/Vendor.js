'use strict'

const Model = require('trails/model')

/**
 * @module Vendor
 * @description Vendor Model
 */
module.exports = class Vendor extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          defaultScope: {
            where: {
              live_mode: app.config.proxyEngine.live_mode
            }
          },
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Vendor.belongsTo(models.Address, {
                as: 'address',
                through: {
                  model: models.ItemAddress,
                  foreignKey: 'model_id',
                  unique: true,
                  scope: {
                    model: 'vendor'
                  },
                  constraints: false
                }
              })
            }
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      handle: {
        type: Sequelize.STRING,
        notNull: true,
        unique: true,
        set: function(val) {
          this.setDataValue('handle', app.services.ProxyCartService.slug(val))
        }
      },
      name: {
        type: Sequelize.STRING,
        notNull: true
      }
    }
    return schema
  }
}
