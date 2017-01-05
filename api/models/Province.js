'use strict'

const Model = require('trails/model')

/**
 * @module Province
 * @description Province Model
 */
module.exports = class Province extends Model {

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
              models.Province.belongsTo(models.Country, {
                // as: 'country_id'
              })
              models.Province.belongsToMany(models.ShippingZone, {
                // as: 'country_id'
                through: 'ShippingZoneProvince'
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
        code: {
          type: Sequelize.STRING
        },
        name: {
          type: Sequelize.STRING
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
          type: Sequelize.STRING
        },
        tax_name: {
          type: Sequelize.STRING
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
