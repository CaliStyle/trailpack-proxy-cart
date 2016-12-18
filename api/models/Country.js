'use strict'

const Model = require('trails/model')

/**
 * @module Country
 * @description Country Model
 */
module.exports = class Country extends Model {

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
              models.Country.belongsTo(models.ShippingZone, {
                // as: 'shipping_zone_id'
              })
              models.Country.hasMany(models.Province, {
                as: 'provinces'
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
        tax: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        tax_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        }
      }
    }
    return schema
  }
}
