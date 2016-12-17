'use strict'

const Model = require('trails/model')

/**
 * @module OrderItem
 * @description Order Item Model
 */
module.exports = class OrderItem extends Model {

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
            // associate: (models) => {
            //   models.Cart.hasMany(models.Product, {
            //     as: 'products'
            //   })
            // }
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

      }
    }
    return schema
  }
}
