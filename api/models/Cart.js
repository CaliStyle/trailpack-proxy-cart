'use strict'

const Model = require('trails/model')

/**
 * @module Cart
 * @description Cart Model
 */
module.exports = class Cart extends Model {

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
              models.Cart.hasMany(models.Product, {
                as: 'products'
              })
              models.Cart.hasMany(models.ProductVariant, {
                as: 'variants'
              })
              models.Cart.hasMany(models.Coupon, {
                as: 'coupons'
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
        tax: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        tax_rate: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        shipping: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        subtotal: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }
      }
    }
    return schema
  }
}
