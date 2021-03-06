'use strict'

const Model = require('trails/model')

/**
 * @module Province
 * @description Province Model
 */
module.exports = class Province extends Model {

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
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.Province.belongsTo(models.Country, {
              // as: 'country_id'
            })
            models.Province.hasMany(models.County, {
              as: 'counties'
            })
            models.Province.belongsToMany(models.ShippingZone, {
              through: {
                model: models.ItemShippingZone,
                unique: false,
                scope: {
                  model: 'province'
                }
              },
              foreignKey: 'shipping_zone_id',
              constraints: false
            })
          },
          resolve: function(province, options){
            //
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
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
}
