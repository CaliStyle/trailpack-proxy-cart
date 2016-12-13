'use strict'

const Model = require('trails/model')

/**
 * @module ProductImage
 * @description Product Image Model
 */
module.exports = class ProductImage extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          classMethods: {
            associate: (models) => {
              models.ProductImage.belongsTo(models.Product, {
                as: 'product_id',
                onDelete: 'CASCADE'
              })
              models.ProductImage.belongsTo(models.ProductVariant, {
                as: 'variant_id',
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
        // Unaltered (raw) Image
        full: {
          type: Sequelize.STRING
        },
        // Thumbnail sized image
        thumbnail: {
          type: Sequelize.STRING
        },
        // Small Image URL
        small: {
          type: Sequelize.STRING
        },
        // Medium Image URL
        medium: {
          type: Sequelize.STRING
        },
        // Large Image URL
        large: {
          type: Sequelize.STRING
        },
        // Image Alt Text (Description)
        alt: {
          type: Sequelize.STRING
        }
      }
    }
    return schema
  }
}
