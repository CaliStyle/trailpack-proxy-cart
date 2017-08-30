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
          scopes: {
            live: {
              where: {
                live_mode: true
              }
            }
          },
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Country.hasMany(models.Province, {
                as: 'provinces'
              })
              models.Country.belongsToMany(models.ShippingZone, {
                through: {
                  model: models.ItemShippingZone,
                  unique: false,
                  scope: {
                    model: 'country'
                  }
                },
                foreignKey: 'shipping_zone_id',
                constraints: false
              })
            },
            resolve: function(country, options){
              //
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
        // Country Code iso-alpha-2
        code: {
          type: Sequelize.STRING
        },
        name: {
          type: Sequelize.STRING
        },
        tax_name: {
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
        position: {
          type: Sequelize.INTEGER,
          defaultValue: 0
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
