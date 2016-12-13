'use strict'

const Model = require('trails/model')

/**
 * @module ProductVariant
 * @description Product Variant Model
 */
module.exports = class ProductVariant extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          classMethods: {
            associate: (models) => {
              models.ProductVariant.belongsTo(models.Product, {
                as: 'product_id',
                onDelete: 'CASCADE'
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

      }
    }
    return schema
  }
}
