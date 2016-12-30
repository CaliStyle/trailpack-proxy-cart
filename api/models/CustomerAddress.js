'use strict'

const Model = require('trails/model')

/**
 * @module CustomerAddress
 * @description Customer Address Model
 */
module.exports = class CustomerAddress extends Model {

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
              // models.CustomerAddress.belongsTo(models.Customer, {
              //   // as: 'customer_id'
              // })
              // models.CustomerAddress.belongsTo(models.Customer, {
              //   foreignKey: 'default_address'
              //   // as: 'customer_id'
              // })
              // models.CustomerAddress.belongsTo(models.Order, {
              //   foreignKey: 'shipping_address'
              //   // as: 'customer_id'
              // })
              // models.CustomerAddress.belongsTo(models.Order, {
              //   foreignKey: 'billing_address'
              //   // as: 'customer_id'
              // })

              models.CustomerAddress.belongsTo(models.Customer, {
                through: {
                  model: models.ItemAddress,
                  unique: false
                },
                foreignKey: 'address_id',
                constraints: false
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
        address_1: {
          type: Sequelize.STRING
        },
        address_2: {
          type: Sequelize.STRING
        },
        address_3: {
          type: Sequelize.STRING
        },
        company: {
          type: Sequelize.STRING
        },
        city: {
          type: Sequelize.STRING
        },
        prefix: {
          type: Sequelize.STRING
        },
        first_name: {
          type: Sequelize.STRING
        },
        last_name: {
          type: Sequelize.STRING
        },
        suffix: {
          type: Sequelize.STRING
        },
        phone: {
          type: Sequelize.STRING
        },
        province: {
          type: Sequelize.STRING
        },
        province_code: {
          type: Sequelize.STRING
        },
        country: {
          type: Sequelize.STRING
        },
        country_code: {
          type: Sequelize.STRING
        },
        country_name: {
          type: Sequelize.STRING
        },
        postal_code: {
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
