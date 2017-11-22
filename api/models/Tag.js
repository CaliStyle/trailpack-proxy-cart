/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const _ = require('lodash')
/**
 * @module Tag
 * @description Tag Model
 */
module.exports = class Tag extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        scopes: {
          live: {
            where: {
              live_mode: true
            }
          }
        },
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.Tag.belongsToMany(models.Product, {
              as: 'products',
              through: {
                model: models.ItemTag,
                unique: false,
                scope: {
                  model: 'product'
                }
              },
              foreignKey: 'tag_id',
              otherKey: 'model_id',
              constraints: false
            })
            models.Tag.belongsToMany(models.Customer, {
              as: 'customers',
              through: {
                model: models.ItemTag,
                unique: false,
                scope: {
                  model: 'customer'
                }
              },
              foreignKey: 'tag_id',
              otherKey: 'model_id',
              constraints: false
            })
            models.Tag.belongsToMany(models.Collection, {
              as: 'collections',
              through: {
                model: models.ItemTag,
                unique: false,
                scope: {
                  model: 'collection'
                }
              },
              foreignKey: 'tag_id',
              otherKey: 'model_id',
              constraints: false
            })
          },
          resolve(tag, options) {
            const Tag = this
            options = options || {}

            if (tag instanceof Tag){
              return Promise.resolve(tag)
            }
            else if (tag && _.isObject(tag) && tag.id) {
              return Tag.findById(tag.id, options)
                .then(foundTag => {
                  if (!foundTag) {
                    // TODO create proper error
                    throw new Error(`Tag with ${tag.id} not found`)
                  }
                  return foundTag
                })
            }
            else if (tag && _.isObject(tag) && tag.name) {
              return Tag.findOne({
                where: {
                  name: tag.name
                }
              }, options)
                .then(resTag => {
                  if (resTag) {
                    return resTag
                  }
                  return Tag.create(tag, options)
                })
            }
            else if (tag && _.isNumber(tag)) {
              return Tag.findById(tag, options)
                .then(foundTag => {
                  if (!foundTag) {
                    // TODO create proper error
                    throw new Error(`Tag with ${tag.id} not found`)
                  }
                  return foundTag
                })
            }
            else if (tag && _.isString(tag)) {
              return Tag.findOne(_.defaultsDeep({
                where: {
                  name: tag,
                }
              }, options))
                .then(resTag => {
                  if (resTag) {
                    return resTag
                  }
                  return Tag.create({name: tag})
                })
            }
            else {
              // TODO make Proper Error
              const err = new Error(`Not able to resolve tag ${tag}`)
              return Promise.reject(err)
            }
          },
          /**
           *
           * @param tags
           * @param options
           * @returns {Promise.<*>}
           */
          transformTags: (tags, options) => {
            options = options || {}
            tags = tags || []

            const Tag = app.orm['Tag']
            const Sequelize = Tag.sequelize

            // Transform tag to object if necessary.
            tags = tags.map(tag => {
              if (tag && _.isNumber(tag)) {
                return { id: tag }
              }
              else if (tag && _.isString(tag)) {
                tag = {
                  name: app.services.ProxyCartService.name(tag)
                }
                return tag
              }
              else if (tag && _.isObject(tag) && tag.name ) {
                tag.name = app.services.ProxyCartService.name(tag.name)
                return tag
              }
            })
            // Filter out undefined
            tags = tags.filter(tag => tag)
            return Sequelize.Promise.mapSeries(tags, tag => {
              const newTag = tag
              return Tag.findOne({
                where: _.pick(tag, ['id','name']),
                attributes: ['id', 'name'],
                transaction: options.transaction || null
              })
                .then(tag => {
                  if (tag) {
                    return tag
                  }
                  else {
                    return Tag.create(newTag, {
                      transaction: options.transaction || null
                    })
                  }
                })
            })
          },
          reverseTransformTags: (tags) => {
            tags = _.map(tags, tag => {
              if (tag && _.isString(tag)) {
                return tag
              }
              else if (tag && tag.name) {
                return tag.name
              }
            })
            return tags
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      // The Tag Name
      name: {
        type: Sequelize.STRING,
        // primaryKey: true,
        // allowNull: false,
        unique: true,
        notNull: true,
        set: function(val) {
          this.setDataValue('name', app.services.ProxyCartService.name(val))
        }
      },

      // Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
