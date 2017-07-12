/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')

/**
 * @module Image
 * @description Image Model
 */
module.exports = class Image extends Model {
  // TODO, after create download and parse
  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          hooks: {
            beforeCreate: (values, options, fn) => {
              app.services.ProxyCartService.buildImages(values.src, options)
                .then(sizes => {
                  // console.log(sizes)
                  values.full = sizes.full
                  values.thumbnail = sizes.thumbnail
                  values.small = sizes.small
                  values.medium = sizes.medium
                  values.large = sizes.large

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
              // models.Image.belongsToMany(models.Product, {
              //   as: 'products',
              //   through: {
              //     model: models.ItemImage,
              //     unique: false,
              //     scope: {
              //       model: 'product'
              //     }
              //   },
              //   foreignKey: 'image_id',
              //   constraints: false
              // })
              // models.Image.belongsToMany(models.ProductVariant, {
              //   as: 'variants',
              //   through: {
              //     model: models.ItemImage,
              //     unique: false,
              //     scope: {
              //       model: 'productvariant'
              //     }
              //   },
              //   foreignKey: 'image_id',
              //   constraints: false
              // })
              models.Image.belongsToMany(models.Collection, {
                as: 'collections',
                through: {
                  model: models.ItemImage,
                  unique: false,
                  scope: {
                    model: 'collection'
                  }
                },
                foreignKey: 'image_id',
                constraints: false
              })
            },
            // TODO
            resolve: function(image, options) {
              return Promise.resolve(image)
            },
            transformImages: (images, options) => {
              const Image = app.orm['Image']
              const Sequelize = Image.sequelize

              options = options || {}
              images = images || []

              return Sequelize.Promise.mapSeries(images, image => {
                if (image.id) {
                  return Image.findById(image.id, {transaction: options.transaction || null})
                }
                else {
                  return Image.create(image, {transaction: options.transaction || null})
                }
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
          type: Sequelize.STRING
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
