/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const _ = require('lodash')
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
              options = options || {}
              images = images || []

              const Image = app.orm['Image']
              const Sequelize = Image.sequelize

              return Sequelize.Promise.mapSeries(images, image => {
                if (image instanceof Image.Instance){
                  return Promise.resolve(image)
                }
                else if (image && image.id) {
                  return Image.findById(image.id, {transaction: options.transaction || null})
                    .then(image => {
                      if (!image) {
                        throw new Error('Image Could not be resolved')
                      }
                      return image
                    })
                }
                else if (image && image.id){
                  return Image.findById(image.id, {transaction: options.transaction || null})
                    .then(image => {
                      if (!image) {
                        throw new Error('Image Could not be resolved to create')
                      }
                      return image
                    })
                }
                else if (image && _.isObject(image)){
                  return Image.create(image, {transaction: options.transaction || null})
                    .then(image => {
                      if (!image) {
                        throw new Error('Image Could not be resolved to create')
                      }
                      return image
                    })
                }
                else if (image && _.isNumber(image)) {
                  return Image.findById(image, {transaction: options.transaction || null})
                    .then(image => {
                      if (!image) {
                        throw new Error('Image Could not be resolved')
                      }
                      return image
                    })
                }
                else if (image && _.isString(image)) {
                  return Image.create({ src: image}, {transaction: options.transaction || null})
                    .then(image => {
                      if (!image) {
                        throw new Error('Image Could not be resolved to create')
                      }
                      return image
                    })
                }
                else {
                  // TODO create proper error
                  const err = new Error(`Unable to resolve Image ${image}`)
                  return Promise.reject(err)
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
