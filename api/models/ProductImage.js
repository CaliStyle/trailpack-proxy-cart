/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')

/**
 * @module ProductImage
 * @description Product Image Model
 */
module.exports = class ProductImage extends Model {
  // TODO, after create download and parse
  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          hooks: {
            beforeCreate: (values, options, fn) => {
              app.services.ProxyCartService.buildImages(values.dataValues.src)
                .then(sizes => {
                  // console.log(sizes)
                  values.dataValues.full = sizes.full
                  values.dataValues.thumbnail = sizes.thumbnail
                  values.dataValues.small = sizes.small
                  values.dataValues.medium = sizes.medium
                  values.dataValues.large = sizes.large

                  // console.log('ProducImage.beforeCreate',values.dataValues)
                  return fn(null, values)
                })
                .catch(err => {
                  fn()
                })

            }
          },
          classMethods: {
            associate: (models) => {
              models.ProductImage.belongsTo(models.Product, {
                // as: 'product_id',
                // foreignKey: 'product_id',
                onDelete: 'CASCADE'
                // foreignKey: {
                //   allowNull: true
                // }
              })
              models.ProductImage.belongsTo(models.ProductVariant, {
                // foreignKey: 'variant_id',
                onDelete: 'CASCADE'
                // foreignKey: {
                //   allowNull: true
                // }
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
        // The original source
        src: {
          type: Sequelize.STRING
        },
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
        },
        // The order of the image in the list of images.
        position: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        }
      }
    }
    return schema
  }
}
