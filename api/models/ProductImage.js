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
    return {
      options: {
        underscored: true,
        hooks: {
          beforeCreate: (values, options) => {
            return app.services.ProxyCartService.buildImages(values.src, options)
              .then(sizes => {
                // console.log(sizes)
                values.full = sizes.full
                values.thumbnail = sizes.thumbnail
                values.small = sizes.small
                values.medium = sizes.medium
                values.large = sizes.large

                // console.log('ProducImage.beforeCreate',values.dataValues)
              })
              .catch(err => {
                return values
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
          },
          resolve: function(image, options) {
            //
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      // The original source
      src: {
        type: Sequelize.STRING,
        allowNull: false
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
        type: Sequelize.STRING,
        set: function(val) {
          this.setDataValue('alt', app.services.ProxyCartService.description(val))
        }
      },
      // The order of the image in the list of images.
      position: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },

      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
