'use strict'

const Model = require('trails/model')

/**
 * @module Product
 * @description Product Model
 */
module.exports = class Product extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          classMethods: {
            associate: (models) => {
              models.Product.hasMany(models.ProductImage, {
                as: 'images',
                onDelete: 'CASCADE'
              })
              models.Product.hasMany(models.ProductVariant, {
                as: 'variants',
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
        //id

        //
        handle: {
          type: Sequelize.STRING
        },
        title: {
          type: Sequelize.STRING
        },
        body: {
          type: Sequelize.TEXT
        },
        seo_title: {
          type: Sequelize.STRING
        },
        seo_description: {
          type: Sequelize.STRING
        },
        type: {
          type: Sequelize.STRING
        },
        tags: {
          type: Sequelize.TEXT
        },
        price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        published: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        published_at: {
          type: Sequelize.DATE
        },
        unpublished_at: {
          type: Sequelize.DATE
        },
        options: {
          type: Sequelize.STRING
        },
        weight: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        weight_unit: {
          type: Sequelize.STRING,
          defaultValue: 'g'
        },
        vendor: {
          type: Sequelize.STRING
        }
      }
    }
    return schema
  }
}
